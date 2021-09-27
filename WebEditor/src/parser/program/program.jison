%{
	// write your code here
	let string = "";
	let char = "";
%}

/* lexical grammar */

%lex

/* regular expresions */
program							"%%PROGRAMA"
LineTerminator					\r|\n|\r\n
WhiteSpace						{LineTerminator}|[ \t\f]

/* comentarios */
LineComment						\/\/[^\r\n]*
CommentContent					([^*]|\*+[^/*])*
DocumentationComment			\/\*{CommentContent}\*+\/
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
include							"include"
void							"void"
main							"main"
int								"int"
char							"char"
float							"float"
array							"arreglo"
const							"const"
if								"if"
else							"else"
switch							"switch"
case							"case"
break							"break"
default							"default"
for								"for"
while							"while"
do								"do"
continue						"continue"
py								"PY"
scanf							"scanf"
printf							"printf"
clear							"clrscr"
getch							"getch"
java							"JAVA"

/* operators */
amp								"&"
numeral							"#"
plus							"+"
minus							"-"
times							"*"
divide							"/"
pow								"^"
mod								"%"
equal							"="
lparen							"("
rparen							")"
lbrace							"{"
rbrace							"}"
lbracket						"["
rbracket						"]"
colon							":"
semi							";"
comma							","
dot								"."

eqeq							"=="
neq								"!="
greater							">"
greater_eq						">="
smaller							"<"
smaller_eq						"<="

and								"&&"
or								"||"
not								"!"

/* lexer states */
%s STRING
%s CHAR
// %x INITIAL

%%

<INITIAL>{program}				return "PROGRAM";
<INITIAL>{include}				return "INCLUDE";
<INITIAL>{void}					return "VOID";
<INITIAL>{main}					return "MAIN";
<INITIAL>{int}					return "INT";
<INITIAL>{char}					return "CHAR";
<INITIAL>{float}				return "FLOAT";
<INITIAL>{array}				return "ARRAY";
<INITIAL>{const}				return "CONST";
<INITIAL>{if}					return "IF";
<INITIAL>{else}					return "ELSE";
<INITIAL>{switch}				return "SWITCH";
<INITIAL>{case}					return "CASE";
<INITIAL>{break}				return "BREAK";
<INITIAL>{default}				return "DEFAULT";
<INITIAL>{for}					return "FOR";
<INITIAL>{while}				return "WHILE";
<INITIAL>{do}					return "DO";
<INITIAL>{continue}				return "CONTINUE";
<INITIAL>{py}					return "PY";
<INITIAL>{scanf}				return "SCANF";
<INITIAL>{printf}				return "PRINTF";
<INITIAL>{clear}				return "CLEAR";
<INITIAL>{getch}				return "GETCH";
<INITIAL>{java}					return "JAVA";

<INITIAL>{numeral}				return "NUMERAL";
<INITIAL>{plus}					return "PLUS";
<INITIAL>{minus}				return "MINUS";
<INITIAL>{times}				return "TIMES";
<INITIAL>{pow}					return "POW";
<INITIAL>{mod}					return "MOD";
<INITIAL>{lparen}				return "LPAREN"
<INITIAL>{rparen}				return "RPAREN";
<INITIAL>{lbrace}				return "LBRACE";
<INITIAL>{rbrace}				return "RBRACE";
<INITIAL>{lbracket}				return "LBRACKET";
<INITIAL>{rbracket}				return "RBRACKET";
<INITIAL>{colon}				return "COLON";
<INITIAL>{semi}					return "SEMI";
<INITIAL>{comma}				return "COMMA";
<INITIAL>{dot}					return "DOT";

<INITIAL>{eqeq}					return "EQEQ";
<INITIAL>{equal}				return "EQUAL";
<INITIAL>{neq}					return "NEQ";
<INITIAL>{greater_eq}			return "GREATER_EQ";
<INITIAL>{smaller_eq}			return "SMALLER_EQ";
<INITIAL>{greater}				return "GREATER";
<INITIAL>{smaller}				return "SMALLER";

<INITIAL>{and}					return "AND";
<INITIAL>{or}					return "OR";
<INITIAL>{not}					return "NOT";
<INITIAL>{amp}					return "AMP";

<INITIAL>{Integer}				return "INTEGER";
<INITIAL>{Decimal}				return "DECIMAL";
<INITIAL>{Id}					return "ID";

<INITIAL>{WhiteSpace}			/* ignore */
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

<INITIAL><<EOF>>				return "EOF";

<INITIAL>.						%{
									console.log(`Error lexico: ${yytext}`);
									return "INVALID";
								%}

/* string state */
<STRING>{d_quote}				%{
									yytext = string;
									this.popState();
									return "STRING";
								%}

<STRING>[^\n\r\"\\%]+			string += yytext;
<STRING>\\t						string += "\t";
<STRING>\\n						string += "\n";
<STRING>\\\"					string += "\"";
<STRING>\\						string += "\\";

/* for scanf and printf */
<STRING>"%d"					string += "%d"; // console.log("print number");

<STRING>"%c"					string += "%c"; // console.log("print char");
<STRING>"%f"					string += "%f"; // console.log("print float");

<STRING>"%"						string += "%";

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
		: program EOF
			{ return true; }
		;

/* programa */
program
		: PROGRAM includes body
		;

body
		: body body_opt
		|
		;

body_opt
		: const
		// | include
		| statement // preguntar
		| assigment // preguntar
		| class_statement
		| main
		;
/* programa */

/* includes */
includes
		: includes include
		|
		;

include
		: NUMERAL INCLUDE PY DOT TIMES SEMI
		| NUMERAL INCLUDE JAVA DOT TIMES SEMI
		// JAVA
		| NUMERAL INCLUDE JAVA DOT dir SEMI
		| NUMERAL INCLUDE JAVA DOT dir DOT TIMES SEMI
		// PY
		| NUMERAL INCLUDE PY DOT dir SEMI
		| NUMERAL INCLUDE PY DOT dir DOT TIMES SEMI
		;

dir
		: dir DOT ID
		| ID
		;
/* includes */

/* main */
main
		: VOID MAIN LPAREN RPAREN LBRACE main_body RBRACE
		;

main_body
		: main_body main_b
		|
		;

main_b
		: statement
		| assigment
		| class_statement
		| list_if
		| while_
		| do_while_
		| continue_
		| break_
		| for_
		| switch_
		| function_call SEMI
		| clear_
		| printf_
		| scanf_
		// | const
		;
/* main */

/* constantes */
const
		: CONST type ID EQUAL a SEMI
		;
/* constantes */

/* statement */
statement
		: type list_opt SEMI
		;

list_opt
		: list_opt COMMA option
		| option
		;

option
		: ID EQUAL a
		| ID
		;
/* statement */

/* assignment */
assigment
		: list_assign SEMI
		;

list_assign
		: list_assign COMMA assign
		| assign
		;

assign
		: ID EQUAL a
		;
/* assignment */

/* tipos de variables */
type
		: INT
		| CHAR
		| FLOAT
		;
/* tipos de variables */

/* class statement */
class_statement
		: JAVA DOT ID list_id SEMI
		| JAVA DOT ID ID LPAREN param RPAREN SEMI
		;

list_id
		: list_id COMMA ID
		| ID
		;

param
		: param COMMA a
		| a
		;
/* class statement */

/* if, else-if and else */
list_if
		: if_
		| if_ else_
		| if_ list_else_if
		| if_ list_else_if else_
		;

if_
		: IF LPAREN a RPAREN LBRACE main_body RBRACE
		;

else_
		: ELSE LBRACE main_body RBRACE
		;

list_else_if
		: list_else_if else_if
		| else_if
		;

else_if
		: ELSE IF LPAREN a RPAREN LBRACE main_body RBRACE
		;
/* if, else-if and else */

/* while and do-while */
while_
		: WHILE LPAREN a RPAREN LBRACE main_body RBRACE
		;

do_while_
		: DO LBRACE main_body RBRACE WHILE LPAREN a RPAREN SEMI
		;
/* while and do-while */

/* for */
for_
		: FOR LPAREN for_assign SEMI a SEMI assign RPAREN LBRACE main_body RBRACE
		;

for_assign
		: INT ID EQUAL a
		| assign
		;
/* for */

/* switch-case */
switch_
		: SWITCH LPAREN a RPAREN LBRACE switch_opt RBRACE
		;

switch_opt
		: list_case
		| list_case default_
		| default_
		|
		;

list_case
		: list_case case_
		| case_
		;

case_
		: CASE a COLON main_body
		;

default_
		: DEFAULT COLON main_body
		;
/* switch-case */

/* continue and break */
continue_
		: CONTINUE SEMI
		;

break_
		: BREAK SEMI
		;
/* continue and break */

/* function call */
function_call
		: PY DOT ID LPAREN params RPAREN
		| JAVA DOT ID DOT ID LPAREN params RPAREN
		| GETCH LPAREN RPAREN
		;

params
		: param
		|
		;

clear_
		: CLEAR LPAREN RPAREN SEMI
		;

printf_
		: PRINTF LPAREN STRING RPAREN SEMI
		| PRINTF LPAREN STRING COMMA param RPAREN SEMI
		;

scanf_
		: SCANF LPAREN STRING COMMA AMP ID RPAREN SEMI
			{ console.log(`scanf: ${$3}`); }
		;
/* function call */

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
		| CHAR
		| STRING { console.log(`value: ${$1}`); }
		// | BOOL
		| ID
		| LPAREN a RPAREN
		| function_call
		;
/* operaciones logicas y aritmeticas */
