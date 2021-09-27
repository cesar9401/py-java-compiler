
%{
	let string = "";
	let char = "";
%}

/* lexical grammar */
%lex

/* regular expresions */
java							"%%JAVA"
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
boolean							"boolean"
break							"break"
case 							"case"
char							"char"
class							"class"
continue						"continue"
default							"default"
do								"do"
double							"double"
else							"else"
extends							"extends"
float							"float"
for								"for"
if								"if"
int								"int"
print							"print"
println							"println"
private							"private"
protected						"protected"
public							"public"
return							"return"
super							"super"
string							"String"
switch							"switch"
this							"this"
void							"void"
false							"false"
true							"true"
while							"while"

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
lbrace							"{"
rbrace							"}"
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

<INITIAL>{java}					return "JAVA";
<INITIAL>{boolean}				return "BOOLEAN";
<INITIAL>{break}				return "BREAK";
<INITIAL>{case}					return "CASE";
<INITIAL>{char}					return "CHARACTER";
<INITIAL>{class}				return "CLASS";
<INITIAL>{continue}				return "CONTINUE";
<INITIAL>{default}				return "DEFAULT";
<INITIAL>{do}					return "DO";
<INITIAL>{double}				return "DOUBLE";
<INITIAL>{else}					return "ELSE";
<INITIAL>{extends}				return "EXTENDS";
<INITIAL>{float}				return "FLOAT";
<INITIAL>{for}					return "FOR";
<INITIAL>{if}					return "IF";
<INITIAL>{int}					return "INT";
<INITIAL>{print}				return "PRINT";
<INITIAL>{println}				return "PRINTLN";
<INITIAL>{private}				return "PRIVATE";
<INITIAL>{protected}			return "PROTECTED";
<INITIAL>{public}				return "PUBLIC";
<INITIAL>{return}				return "RETURN";
<INITIAL>{super}				return "SUPER";
<INITIAL>{string}				return "STR";
<INITIAL>{switch}				return "SWITCH";
<INITIAL>{this}					return "THIS";
<INITIAL>{void}					return "VOID";
<INITIAL>{false}				return "BOOL";
<INITIAL>{true}					return "BOOL";
<INITIAL>{while}				return "WHILE";

<INITIAL>{plus}					return "PLUS";
<INITIAL>{minus}				return "MINUS";
<INITIAL>{times}				return "TIMES";
<INITIAL>{pow}					return "POW";
<INITIAL>{mod}					return "MOD";
<INITIAL>{lparen}				return "LPAREN";
<INITIAL>{rparen}				return "RPAREN";
<INITIAL>{lbrace}				return "LBRACE";
<INITIAL>{rbrace}				return "RBRACE";
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
		: java EOF
			{ return true; }
		;

java
		: JAVA list_of_classes
		;

list_of_classes
		: list_of_classes class
		|
		;

class
		: CLASS ID LBRACE items_class RBRACE
		| CLASS ID EXTENDS ID LBRACE items_class RBRACE
		;

items_class
		: items_class class_opt
		|
		;

class_opt
		: statement_class
		| construct
		| function
		;

/* constructores */
construct
		: access ID LPAREN list_params RPAREN LBRACE function_body RBRACE
		;
/* constructores */

/* funciones */
function
		: access type ID LPAREN list_params RPAREN LBRACE function_body RBRACE
		;
/* funciones */

/* parametros */
list_params
		: params
		|
		;

params
		: params COMMA param
		| param
		;

param
		: type ID
		;
/* parametros */

/* declaracion de variables */
statement
		: type list_opt SEMI
		;

statement_class
		: access type list_opt SEMI
		;

type
		: CHARACTER
		| STR
		| INT
		| DOUBLE
		| FLOAT
		| BOOLEAN
		| VOID // only for functions
		;

list_opt
		: list_opt COMMA option
		| option
		;

option
		: ID EQUAL a
		| ID
		;

access
		: PRIVATE
		| PROTECTED
		| PUBLIC
		;
/* declaracion de variables */

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
		| THIS DOT ID EQUAL a
		| SUPER DOT ID EQUAL a // herencia
		;
/* assignment */

/* function body */
function_body
		: function_body func_body
		|
		;

/* instrucciones dentro de una funcion */
func_body
		: statement
		| assigment
		| print_
		| list_if
		| for_
		| while_
		| do_while_
		| switch_
		| break_
		| continue_
		| return_
		| super_
		| function_call SEMI
		;
/* function body */

/* if, else-if and else */
list_if
		: if_
		| if_ else_
		| if_ list_else_if
		| if_ list_else_if else_
		;

if_
		: IF LPAREN a RPAREN LBRACE function_body RBRACE
		;

else_
		: ELSE LBRACE function_body RBRACE
		;

list_else_if
		: list_else_if else_if
		| else_if
		;

else_if
		: ELSE IF LPAREN a RPAREN LBRACE function_body RBRACE
		;
/* if, else-if and else */

/* for */
for_
		: FOR LPAREN for_assign SEMI a SEMI assign RPAREN LBRACE function_body RBRACE
		;

for_assign
		: INT ID EQUAL a
		| assign
		;
/* for */

/* while and do-while */
while_
		: WHILE LPAREN a RPAREN LBRACE function_body RBRACE
		;

do_while_
		: DO LBRACE function_body RBRACE WHILE LPAREN a RPAREN SEMI
		;
/* while and do-while */

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
		: CASE a COLON function_body
		;

default_
		: DEFAULT COLON function_body
		;
/* switch-case */

/* print and println */
print_
		: PRINT LPAREN list_op RPAREN SEMI
		| PRINTLN LPAREN list_op RPAREN SEMI
		;

list_op
		: list_op COMMA a
		| a
		;
/* print and println */

/* break, continue, return */
break_
		: BREAK SEMI
		;

continue_
		: CONTINUE SEMI
		;

return_
		: RETURN a SEMI
		;
/* break, continue, return */

/* extends */
super_
		: SUPER LPAREN args_ RPAREN SEMI
		;

args_
		: list_op
		|
		;
/* extends */

/* function call */
function_call
		: ID LPAREN args_ RPAREN
		| THIS DOT ID LPAREN args_ RPAREN
		| SUPER DOT ID LPAREN args_ RPAREN
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
		| STRING
		| CHAR
		| BOOL
		| ID
		| LPAREN a RPAREN
		| THIS DOT ID // this
		| SUPER DOT ID // herencia
		| function_call //  llamada de funciones
		;
/* operaciones logicas y aritmeticas */
