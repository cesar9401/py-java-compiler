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
// %x INITIAL

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

<INITIAL>{Integer}				return "INTEGER";
<INITIAL>{Decimal}				return "DECIMAL";
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

<LINE>{WhiteSpace}				/* ignore */

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
<STRING>\\t						string += "\t";
<STRING>\\n						string += "\n";
<STRING>\\\"					string += "\"";
<STRING>\\						string += "\\";

/* char state */
<CHAR>{s_quote}					%{
									yytext = char;
									this.popState();
									return "CHAR";
								%}

<CHAR>[^\n\r\'\\]+				char += yytext;
<CHAR>\\t						char += "\t";
<CHAR>\\n						char += "\n";
<CHAR>\\\'						char += "\'";
<CHAR>\\						char += "\\";

/lex

%start initial

%%

initial
		: python EOF
			{ return true; }
		;

python
		: PY eol INDENT list_function DEDENT
		| PY eol
		;

list_function
		: list_function function
		| function
		;

body
		: body func_body
		| func_body
		;

func_body
		: statement eol
		| assigment eol
		| list_if
		| while__
		| for__
		| return_ eol
		| break_ eol
		| continue_ eol
		| print_ eol
		;

/* declaracion de variables */
statement
		: list_id
		;

list_id
		: list_id COMMA ID
		| ID
		;
/* declaracion de variables */

/* declaracion y asignacion */
assigment
		: list_id EQUAL list_op
		;

list_op
		: list_op COMMA a
		| a
		;
/* declaracion y asignacion */

/* if, elif, else */
list_if
		: if_
		| if_ else_
		| if_ list_elif
		| if_ list_elif else_
		;

if_
		: IF a COLON eol function_body
		;

else_
		: ELSE COLON eol function_body
		;

list_elif
		: list_elif elif_
		| elif_
		;

elif_
		: ELIF a COLON eol function_body
		;
/* if, elif, else */

/* while */
while__
		: while_
		| while_ else_
		;

while_
		: WHILE a COLON eol function_body
		;
/* while */

/* for */
for__
		: for_
		| for_ else_
		;

for_
		: FOR a IN range COLON eol function_body
		;

range
		: RANGE LPAREN a RPAREN
		| RANGE LPAREN a COMMA a RPAREN
		| RANGE LPAREN a COMMA a COMMA a RPAREN
		;
/* for */

/* cuerpo de una funcion */
function_body
		: INDENT body DEDENT
		|
		;
/* cuerpo de una funcion */

/* funcion */
function
		: DEF ID LPAREN params RPAREN COLON eol function_body
		;

params
		: list_id
		|
		;
/* funcion */

/* break, continue, return */
break_
		: BREAK
		;

continue_
		: CONTINUE
		;

return_
		: RETURN a
		;
/* break, continue, return */

/* print and println */
print_
		: PRINT LPAREN list_op RPAREN
		| PRINTLN LPAREN list_op RPAREN
		;
/* print and println */

/* operaciones logicas y aritmeticas */
a
		: a OR b
		| b
		;

b
		: b AND c
		| c
		;

c
		: c EQEQ d
		| c NEQ d
		| c GREATER d
		| c GREATER_EQ d
		| c SMALLER d
		| c SMALLER_EQ d
		| d
		;

d
		: d PLUS e
		| d MINUS e
		| e
		;

e
		: e TIMES f
		| e DIVIDE f
		| e MOD f
		| f
		;

f
		: g POW f
		| g
		;

g
		: MINUS h
		| h
		;

h
		: NOT h
		| i
		;

i
		: INTEGER
		| DECIMAL
		| STRING
		| CHAR
		| BOOL
		| ID
		| LPAREN a RPAREN
		;
/* operaciones logicas y aritmeticas */

/* fin de linea */
eol
		: eol EOL
		| EOL
		;

eol_
		: eol_ EOL
		|
		;
/* fin de linea */
