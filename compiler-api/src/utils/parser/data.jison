%{
	// write your code here
	let string = "";
	const File = require('../../model/file');
	const Package = require('../../model/package');
	const Project = require('../../model/project');
%}


/* lexical grammar */

%lex

/* regular expresions */

root							[<]"root"[>]
root_c							[<][/]"root"[>]
project							[<]"project"[>]
project_c						[<][/]"project"[>]
name							[<]"name"[>]
name_c							[<][/]"name"[>]
file							[<]"file"[>]
file_c							[<][/]"file"[>]
code							[<]"code"[>]
code_c							[<][/]"code"[>]
package							[<]"package"[>]
package_c						[<][/]"package"[>]

LineTerminator					\r|\n|\r\n
WhiteSpace						{LineTerminator}|[ \t\f]
french_quote					[`]

%s STRING
// %x INITIAL

%%

<INITIAL>{root}					return "ROOT";
<INITIAL>{root_c}				return "ROOT_C";
<INITIAL>{project}				return "PROJECT";
<INITIAL>{project_c}			return "PROJECT_C";
<INITIAL>{name}					return "NAME";
<INITIAL>{name_c}				return "NAME_C"
<INITIAL>{file}					return "FILE";
<INITIAL>{file_c}				return "FILE_C";
<INITIAL>{code}					return "CODE";
<INITIAL>{code_c}				return "CODE_C";
<INITIAL>{package}				return "PACKAGE";
<INITIAL>{package_c}			return "PACKAGE_C"

<INITIAL>{WhiteSpace}			/* ignore */

<INITIAL>{french_quote}			%{
									string = "";
									this.pushState("STRING");
								%}

<INITIAL><<EOF>>				return "EOF";

<INITIAL>.						%{
									console.log(`Error lexico: ${yytext}`);
									return "INVALID";
								%}

<STRING>{french_quote}			%{
									yytext = string;
									this.popState();
									return "STRING";
								%}

<STRING>[^\n\r\`\\]+			string += yytext;
<STRING>[\n]					string += yytext;
<STRING>[\t]					string += yytext;
<STRING>\\t						string += "\\t";
<STRING>\\n						string += "\\n";
<STRING>\\\"					string += "\\\"";
<STRING>\\						string += "\\\\";

/lex

%start initial

%%

initial
		: data EOF
			{ return $1; }
		;

data
		: ROOT projects ROOT_C
			{ $$ = $2; }
		;

projects
		: projects project { $1.push($2); $$ = $1; }
		| { $$ = []; }
		;

project
		: PROJECT name files content_p PROJECT_C
			{ $$ = new Project($2, $3, $4); }
		;

package
		: PACKAGE name files content_p PACKAGE_C
			{ $$ = new Package($2, $3, $4); }
		;

content_p
		: content_p package { $1.push($2); $$ = $1; }
		| { $$ = []; }
		;

files
		: files file { $1.push($2); $$ = $1; }
		| { $$ = []; }
		;

file
		: FILE name code FILE_C
			{ $$ = new File($2, $3); }
		;

name
		: NAME STRING NAME_C
			{ $$ = $2; }
		;

code
		: CODE STRING CODE_C
			{ $$ = $2; }
		;
