
/* lexical grammar */
%lex

/* regular expresions */
python						"%%PY"
java						"%%JAVA"
program						"%%PROGRAMA"
input						([^\n\r]|[\n])*

/* lexer states */
%s JAVA
%s PYTHON
%s PROGRAM
%x INITIAL

%%

<INITIAL>{input}{python}	 	%{
									this.unput("%%PY");
									this.pushState('PYTHON');
									return "PACKAGE";
								%}

<PYTHON>{python}{input}{java}	%{
									this.unput("%%JAVA");
									this.pushState('JAVA');
									return "PY";
								%}

<JAVA>{java}{input}{program}	%{
									this.unput("%%PROGRAMA");
									this.pushState('PROGRAM');
									return "JAVA";
								%}

<PROGRAM>{program}{input}	 	%{
									return "PROGRAM";
								%}
<PROGRAM><<EOF>>			return "EOF";

/lex

%start main

%%

main
		: input	EOF
			{ return $1; }
		;

input
		: package py java program
			{ $$ = [$1, $2, $3, $4]; }
		;

package
		: PACKAGE
			{ $$ = new yy.Code("package", $1, this._$.first_line, this._$.last_line, this._$.first_column, this._$.last_column); }
		;

py
		: PY
			{ $$ = new yy.Code("python", $1, this._$.first_line, this._$.last_line, this._$.first_column, this._$.last_column); }
		;

java
		: JAVA
			{ $$ = new yy.Code("java", $1, this._$.first_line, this._$.last_line, this._$.first_column, this._$.last_column); }
		;

program
		: PROGRAM
			{ $$ = new yy.Code("program", $1, this._$.first_line, this._$.last_line, this._$.first_column, this._$.last_column); }
		;