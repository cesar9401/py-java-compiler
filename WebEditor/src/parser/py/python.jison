%{
	let indents = [0];
	let string = "";
	let char = "";
%}

/* lexical grammar */
%lex

/* regular expresions */
py								"%%PY"

LineTerminator					\r|\n|\r\n
Whitespace						[ \t]+
Tab								[\t]

/* comentarios */
LineComment						[ \t]*\/\/[^\r\n]*
CommentContent					([^*]|\*+[^/*])*
DocumentationComment			[ \t]*\/\*{CommentContent}\*+\/
Comment							{LineComment}|{DocumentationComment}

/* comillas dobles y simples */
d_quote							["]
s_quote							[']

/* Integer */
Integer							[1-9][0-9]+|[0-9]

/* Decimales */
Decimal							{Integer}\.[0-9]+

/* id */
Id								[a-zA-Z_]\w*

/* reserved words */
print							"print"
println							"println"
false							"False"
true							"True"
and								"and"
or								"or"
not								"not"
break							"break"
continue						"continue"
return							"return"
def								"def"
for								"for"
in								"in"
if								"if"
elif							"elif"
else							"else"
while							"while"
range							"range"
input							"input"

/* operators */
plus							"+"
minus							"-"
times							"*"
divide							"/"
pow								"^"
mod								"%"
equal							"="
lparen							"("
rparen							")"
colon							":"
comma							","

eqeq							"=="
neq								"!="
greater							">"
greater_eq						">="
smaller							"<"
smaller_eq						"<="

/* lexer states */
%s LINE
%s STRING
%s CHAR
%x INITIAL

%%

<INITIAL>{py}					return "PY";
<INITIAL>{print}				return "PRINT";
<INITIAL>{println}				return "PRINTLN";
<INITIAL>{false}				return "BOOL";
<INITIAL>{true}					return "BOOL";
<INITIAL>{and}					return "AND";
<INITIAL>{or}					return "OR";
<INITIAL>{not}					return "NOT";
<INITIAL>{break}				return "BREAK";
<INITIAL>{continue}				return "CONTINUE";
<INITIAL>{return}				return "RETURN";
<INITIAL>{def}					return "DEF";
<INITIAL>{for}					return "FOR";
<INITIAL>{in}					return "IN";
<INITIAL>{if}					return "IF";
<INITIAL>{elif}					return "ELIF";
<INITIAL>{else}					return "ELSE";
<INITIAL>{while}				return "WHILE";
<INITIAL>{range}				return "RANGE";
<INITIAL>{input}				return "INPUT";

<INITIAL>{plus}					return "PLUS";
<INITIAL>{minus}				return "MINUS";
<INITIAL>{times}				return "TIMES";
<INITIAL>{pow}					return "POW";
<INITIAL>{mod}					return "MOD";
<INITIAL>{lparen}				return "LPAREN";
<INITIAL>{rparen}				return "RPAREN";
<INITIAL>{colon}				return "COLON";
<INITIAL>{comma}				return "COMMA";
<INITIAL>{eqeq}					return "EQEQ";
<INITIAL>{equal}				return "EQUAL";
<INITIAL>{neq}					return "NEQ";
<INITIAL>{greater_eq}			return "GREATER_EQ";
<INITIAL>{greater}				return "GREATER";
<INITIAL>{smaller_eq}			return "SMALLER_EQ";
<INITIAL>{smaller}				return "SMALLER";

<INITIAL>{Decimal}				return "DECIMAL";
<INITIAL>{Integer}				return "INTEGER";
<INITIAL>{Id}					return "ID";

<INITIAL>{Whitespace}			/* ignore */
<INITIAL>{Comment}				/* ignore */

<INITIAL>{divide}				return "DIVIDE";

<INITIAL>{d_quote}				%{
									string = "";
									this.pushState("STRING");
								%}

<INITIAL>{s_quote}				%{
									char = "";
									this.pushState("CHAR");
								%}

<INITIAL>{LineTerminator}		%{
									if(this.matches.input === '\n') {
										// console.log(this);
										while(indents.length > 1) {
											this.unput(yytext);
											indents.pop();
											return "DEDENT";
										}
										return "EOF";
									}
									this.pushState("LINE");
									return "EOL";
								%}

<INITIAL><<EOF>>				return "EOF";

<INITIAL>.						%{
									console.log(`Error lexico: ${yytext}`);
									// console.log(this);
									return "INVALID";
								%}

<LINE>[\n]						%{
									if(this.matches.input === '\n') {
										// console.log(this);
										while(indents.length > 1) {
											this.unput(yytext);
											indents.pop();
											return "DEDENT";
										}
										return "EOF";
									}
									return "EOL";
								%}

<LINE>{Comment}					/* ignore */

<LINE>{Whitespace}[\n]			/* ignore */
<LINE>({Tab}|"    ")+			%{
									let text = yytext.replace(/    /g, "\t")
									let ind = text.length;
									let last = indents[indents.length - 1];
									// console.log(`Identacion -> ${ind}`);

									if(last === 0) {
										if(ind > 1) {
											console.log(`Error de identacion: ${ind}`);
											this.popState();
										} else {
											indents.push(ind);
											this.popState();
											return "INDENT";
										}
									} else if(ind === last) {
										// do nothing
										this.popState();
									} else if(ind === last + 1) {
										indents.push(ind);
										this.popState();
										return "INDENT";
									} else if(ind > last + 1) {
										console.log(`Error de identacion: ${ind}`);
										this.popState();
									} else if(ind < last) {
										while(ind !== last) {
											last = indents.pop();
											this.unput(yytext);
											return "DEDENT";
										}
										this.popState();
									}
								%}

<LINE>{Whitespace}				/* ignore */

<LINE><<EOF>>					return "EOF";

<LINE>.							%{
									this.unput(yytext);
									this.popState();
								%}

/* string state */
<STRING>{d_quote}				%{
									yytext = string;
									this.popState();
									return "STRING";
								%}

<STRING>[^\n\r\"\\]+			string += yytext;
<STRING>\\t						string += "\\t";
<STRING>\\n						string += "\\n";
<STRING>\\\"					string += "\\\"";
<STRING>\\						string += "\\\\";

/* char state */
<CHAR>{s_quote}					%{
									yytext = char;
									this.popState();
									return "STRING";
								%}

<CHAR>[^\n\r\'\\]+				char += yytext;
<CHAR>\\t						char += "\\t";
<CHAR>\\n						char += "\\n";
<CHAR>\\\'						char += "\\\'";
<CHAR>\\						char += "\\\\";

/lex

%start initial

%%

initial
		: python EOF
			{ return $1; }
		;

python
		: PY eol INDENT list_function DEDENT{ $$ = $4; }
		| PY eol { $$ = []; }
		;

list_function
		: list_function function { $1.push($2); $$ = $1; }
		| function { $$ = [$1]; }
		;

body
		: body func_body { $$ = [...$1, ...$2]; }
		| func_body { $$ = [...$1]; }
		;

func_body
		: statement eol
		| assigment eol { $$ = [$1]; }
		| list_if { $$ = [$1]; }
		| while__ { $$ = [$1]; }
		| for__ { $$ = [$1]; }
		| return_ eol { $$ = [$1]; }
		| break_ eol { $$ = [$1]; }
		| continue_ eol { $$ = [$1]; }
		| print_ eol { $$ = [$1]; }
		;

/* declaracion de variables */
statement
		: list_id
		;

list_id
		: list_id COMMA ID { $1.push($3); $$ = $1; }
		| ID { $$ = []; $$.push($1); }
		;
/* declaracion de variables */

/* declaracion y asignacion */
assigment
		: list_id EQUAL list_op
			{ $$ = new yy.AssignmentPY(this._$.first_line + yy.line, this._$.first_column, $1, $3); }
		;

list_op
		: list_op COMMA a { $1.push($3); $$ = $1; }
		| a { $$ = []; $$.push($1); }
		;
/* declaracion y asignacion */

/* if, elif, else */
list_if
		: if_ { $$ = new yy.IfInstructionPY(this._$.first_line + yy.line, this._$.first_column, [$1]); }
		| if_ else_ { $$ = new yy.IfInstructionPY(this._$.first_line + yy.line, this._$.first_column, [$1, $2]); }
		| if_ list_elif { $$ = new yy.IfInstructionPY(this._$.first_line + yy.line, this._$.first_column, [$1, ...$2]); }
		| if_ list_elif else_ { $$ = new yy.IfInstructionPY(this._$.first_line + yy.line, this._$.first_column, [$1, ...$2, $3]); }
		;

if_
		: IF a COLON eol function_body
			{ $$ = new yy.IfPY(this._$.first_line + yy.line, this._$.first_column, "IF", $5, $2); }
		;

else_
		: ELSE COLON eol function_body
			{ $$ = new yy.IfPY(this._$.first_line + yy.line, this._$.first_column, "ELSE", $4, null); }
		;

list_elif
		: list_elif elif_ { $1.push($2); $$ = $1; }
		| elif_ { $$ = [$1]; }
		;

elif_
		: ELIF a COLON eol function_body
			{ $$ = new yy.IfPY(this._$.first_line + yy.line, this._$.first_column, "ELIF", $5, $2); }
		;
/* if, elif, else */

/* while */
while__
		: while_ { $$ = $1; }
		| while_ else_
		;

while_
		: WHILE a COLON eol function_body
			{ $$ = new yy.WhilePY(this._$.first_line + yy.line, this._$.first_column, $2, $5); }
		;
/* while */

/* for */
for__
		: for_ { $$ = $1; }
		| for_ else_
		;

for_
		: FOR ID IN range COLON eol function_body
			{ $$ = new yy.ForPY(this._$.first_line + yy.line, this._$.first_column, $2, $4, $7); }
		;

range
		: RANGE LPAREN a RPAREN
			%{
				const tmp6 = new yy.Variable(yy.OperationType.INT, null, "0");
				const tmp7 = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.INT, tmp6);

				const tmp8 = new yy.Variable(yy.OperationType.INT, null, "1");
				const tmp9 = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.INT, tmp8);
				$$ = [tmp7, $3, tmp9]; // range(0, $3, 1) inicio en 0, incremento en 1
			%}
		| RANGE LPAREN a COMMA a RPAREN
			%{
				const tmp10 = new yy.Variable(yy.OperationType.INT, null, "1");
				const tmp11 = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.INT, tmp10);
				$$ = [$3, $5, tmp11]; //range($3, $5, 1) inicio en $3, incremento en 1
			%}
		| RANGE LPAREN a COMMA a COMMA a RPAREN { $$ = [$3, $5, $7]; }
		;
/* for */

/* cuerpo de una funcion */
function_body
		: INDENT body DEDENT { $$ = $2; }
		| { $$ = []; }
		;
/* cuerpo de una funcion */

/* funcion */
function
		: DEF ID LPAREN params RPAREN COLON eol function_body
			{ $$ = new yy.FunctionPY(this._$.first_line + yy.line, this._$.first_column, $2, $4, $8); }
		;

params
		: list_id { $$ = $1; }
		| { $$ = []; }
		;
/* funcion */

/* break, continue, return */
break_
		: BREAK { $$ = new yy.Break(this._$.first_line + yy.line, this._$.first_column); }
		;

continue_
		: CONTINUE { $$ = new yy.Continue(this._$.first_line + yy.line, this._$.first_column); }
		;

return_
		: RETURN a { $$ = new yy.ReturnPY(this._$.first_line + yy.line, this._$.first_column, $2); }
		;
/* break, continue, return */

/* input */
input_
		: INPUT LPAREN RPAREN
		;
/* input */

/* print and println */
print_
		: PRINT LPAREN list_op RPAREN
			{ $$ = new yy.PrintPY(this._$.first_line + yy.line, this._$.first_column, false, $3); }
		| PRINTLN LPAREN list_op RPAREN
			{ $$ = new yy.PrintPY(this._$.first_line + yy.line, this._$.first_column, true, $3); }
		;
/* print and println */

/* operaciones logicas y aritmeticas */
a
		: a OR b { $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.OR, $1, $3); }
		| b { $$ = $1; }
		;

b
		: b AND c { $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.AND, $1, $3); }
		| c { $$ = $1; }
		;

c
		: c EQEQ d { $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.EQEQ, $1, $3); }
		| c NEQ d { $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.NEQ, $1, $3); }
		| c GREATER d { $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.GREATER, $1, $3); }
		| c GREATER_EQ d { $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.GREATER_EQ, $1, $3); }
		| c SMALLER d { $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.SMALLER, $1, $3); }
		| c SMALLER_EQ d { $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.SMALLER_EQ, $1, $3); }
		| d { $$ = $1; }
		;

d
		: d PLUS e { $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.SUM, $1, $3); }
		| d MINUS e { $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.SUB, $1, $3); }
		| e { $$ = $1; }
		;

e
		: e TIMES f { $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.MUL, $1, $3); }
		| e DIVIDE f { $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.DIV, $1, $3); }
		| e MOD f { $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.MOD, $1, $3); }
		| f { $$ = $1; }
		;

f
		: g POW f { $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.POW, $1, $3); }
		| g { $$ = $1; }
		;

g
		: MINUS h { $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.UMINUS, $2, null); }
		| h { $$ = $1; }
		;

h
		: NOT h { $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.NOT, $2, null); }
		| i { $$ = $1; }
		;

i
		: INTEGER { const tmp1 = new yy.Variable(yy.OperationType.INT, null, $1); $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.INT, tmp1); }
		| DECIMAL { const tmp2 = new yy.Variable(yy.OperationType.FLOAT, null, $1); $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.FLOAT, tmp2); }
		| STRING { const tmp3 = new yy.Variable(yy.OperationType.STRING, null, $1); $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.STRING, tmp3); }
		// | CHAR
		| BOOL { const tmp4 = new yy.Variable(yy.OperationType.BOOL, null, $1); $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.BOOL, tmp4); }
		| ID { const tmp5 = new yy.Variable(yy.OperationType.ID, $1, null); $$ = new yy.OperationPY(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.ID, tmp5); }
		| LPAREN a RPAREN { $$ = $2; }
		;
/* operaciones logicas y aritmeticas */

/* fin de linea */
eol
		: eol EOL
		| EOL
		;
/* fin de linea */
