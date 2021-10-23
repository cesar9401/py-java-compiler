
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

<INITIAL>{Decimal}				return "DECIMAL";
<INITIAL>{Integer}				return "INTEGER";
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
<STRING>\\t						string += "\\t";
<STRING>\\n						string += "\\n";
<STRING>\\\"					string += "\\\"";
<STRING>\\						string += "\\\\";

/* char state */
<CHAR>{s_quote}					%{
									yytext = char;
									this.popState();
									return "CHAR";
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
		: java EOF
			{ return $1; }
		;

java
		: JAVA list_of_classes
			{ $$ = $2; }
		;

list_of_classes
		: list_of_classes class { $1.push($2); $$ = $1; }
		| { $$ = []; }
		;

class
		: PUBLIC CLASS ID LBRACE items_class RBRACE
			{ $$ = new yy.ClassJV(this._$.first_line + yy.line, this._$.first_column, $3, '', $5); }
		| PUBLIC CLASS ID EXTENDS ID LBRACE items_class RBRACE
			{ $$ = new yy.ClassJV(this._$.first_line + yy.line, this._$.first_column, $3, $5, $7); }
		;

items_class
		: items_class class_opt { $$ = [...$1, ...$2]; }
		| { $$ = []; }
		;

class_opt
		: statement_class { $$ = [...$1]; }
		| construct { $$ = [$1]; }
		| function { $$ = [$1]; }
		;

/* constructores */
construct
		: access ID LPAREN list_params RPAREN LBRACE function_body RBRACE
			{ $$ = new yy.ConstructorJV(this._$.first_line + yy.line, this._$.first_column, $1, $2, $4, $7); }
		;
/* constructores */

/* funciones */
function
		: access type ID LPAREN list_params RPAREN LBRACE function_body RBRACE
			{ $$ = new yy.MethodJV(this._$.first_line + yy.line, this._$.first_column, $1, $2, $3, $5, $8); }
		;
/* funciones */

/* parametros */
list_params
		: params { $$ = $1; }
		| { $$ = []; }
		;

params
		: params COMMA param { $1.push($3); $$ = $1; }
		| param { $$ = [$1]; }
		;

param
		: type ID { $$ = new yy.ParamJV(this._$.first_line + yy.line, this._$.first_column, $1, $2); }
		;
/* parametros */

/* declaracion de variables */
statement
		: type list_opt SEMI
			%{
				$$ = [];
				for(const element of $2) {
					if(element.length === 1) {
						const tmp = new yy.StatementJV(this._$.first_line + yy.line, this._$.first_column, 'public', $1, element[0], null);
						$$.push(tmp);
					} else if(element.length === 2) {
						const tmp = new yy.StatementJV(this._$.first_line + yy.line, this._$.first_column, 'public', $1, element[0], element[1]);
						$$.push(tmp);
					}
				}
			%}
		;

statement_class
		: access type list_opt SEMI
			%{
				$$ = [];
				for(const element of $3) {
					if(element.length === 1) {
						const tmp = new yy.StatementJV(this._$.first_line + yy.line, this._$.first_column, $1, $2, element[0], null);
						tmp.clazz = true;
						$$.push(tmp);
					} else if(element.length === 2) {
						const tmp = new yy.StatementJV(this._$.first_line + yy.line, this._$.first_column, $1, $2, element[0], element[1]);
						$$.push(tmp);
					}
				}
			%}
		;

type
		: CHARACTER { $$ = yy.OperationType.CHAR; }
		| STR { $$ = yy.OperationType.STRING; }
		| INT { $$ = yy.OperationType.INT; }
		| DOUBLE
		| FLOAT { $$ = yy.OperationType.FLOAT; }
		| BOOLEAN { $$ = yy.OperationType.BOOL; }
		| VOID  { $$ = yy.OperationType.VOID; } // only for functions
		;

list_opt
		: list_opt COMMA option { $1.push($3); $$ = $1; }
		| option { $$ = []; $$.push($1); }
		;

option
		: ID EQUAL a { $$ = [$1, $3]; }
		| ID { $$ = [$1]; }
		;

access
		: PRIVATE { $$ = $1; }
		| PROTECTED { $$ = $1; }
		| PUBLIC { $$ = $1; }
		| { $$ = 'public'; }
		;
/* declaracion de variables */

/* assignment */
assigment
		: list_assign SEMI
			{ $$ = $1; }
		;

list_assign
		: list_assign COMMA assign { $1.push($3); $$ = $1; }
		| assign { $$ = [$1];  }
		;

assign
		: ID EQUAL a { $$ = new yy.AssignmentJV(this._$.first_line + yy.line, this._$.first_column, false, $1, $3); }
		| THIS DOT ID EQUAL a { $$ = new yy.AssignmentJV(this._$.first_line + yy.line, this._$.first_column, true, $3, $5); }
		| SUPER DOT ID EQUAL a // herencia
		;
/* assignment */

/* function body */
function_body
		: function_body func_body { $$ = [...$1, ...$2]; }
		| { $$ = []; }
		;

/* instrucciones dentro de una funcion */
func_body
		: statement { $$ = [...$1]; }
		| assigment { $$ = [...$1]; }
		| print_ { $$ = [$1]; }
		| list_if { $$ = [$1]; }
		| for_ { $$ = [$1]; }
		| while_ { $$ = [$1]; }
		| do_while_ { $$ = [$1]; }
		| switch_ { $$ = [$1]; }
		| break_ { $$ = [$1]; }
		| continue_ { $$ = [$1]; }
		| return_ { $$ = [$1]; }
		| super_
		| function_call SEMI
		;
/* function body */

/* if, else-if and else */
list_if
		: if_ { $$ = new yy.IfInstructionJV(this._$.first_line + yy.line, this._$.first_column, [$1]); }
		| if_ else_ { $$ = new yy.IfInstructionJV(this._$.first_line + yy.line, this._$.first_column, [$1, $2]); }
		| if_ list_else_if { $$ = new yy.IfInstructionJV(this._$.first_line + yy.line, this._$.first_column, [$1, ...$2]); }
		| if_ list_else_if else_ { $$ = new yy.IfInstructionJV(this._$.first_line + yy.line, this._$.first_column, [$1, ...$2, $3]); }
		;

if_
		: IF LPAREN a RPAREN LBRACE function_body RBRACE
			{ $$ = new yy.IfJV(this._$.first_line + yy.line, this._$.first_column, "if", $6, $3); }
		;

else_
		: ELSE LBRACE function_body RBRACE
			{ $$ = new yy.IfJV(this._$.first_line + yy.line, this._$.first_column, "else", $3, null); }
		;

list_else_if
		: list_else_if else_if { $1.push($2); $$ = $1; }
		| else_if { $$ = [$1]; }
		;

else_if
		: ELSE IF LPAREN a RPAREN LBRACE function_body RBRACE
			{ $$ = new yy.IfJV(this._$.first_line + yy.line, this._$.first_column, "if else", $7, $4); }
		;
/* if, else-if and else */

/* for */
for_
		: FOR LPAREN INT ID EQUAL a SEMI a SEMI assign RPAREN LBRACE function_body RBRACE
			%{
				const tmp_s = new yy.StatementJV(this._$.first_line + yy.line, this._$.first_column, "public", yy.OperationType.INT, $4, $6);
				$$ = new yy.ForJV(this._$.first_line + yy.line, this._$.first_column, $8, $10, $13, tmp_s, null);
			%}
		| FOR LPAREN assign SEMI a SEMI assign RPAREN LBRACE function_body RBRACE
			{ $$ = new yy.ForJV(this._$.first_line + yy.line, this._$.first_column, $5, $7, $10, null, $3); }
		;
/* for */

/* while and do-while */
while_
		: WHILE LPAREN a RPAREN LBRACE function_body RBRACE
			{ $$ = new yy.WhileJV(this._$.first_line + yy.line, this._$.first_column, $3, $6); }
		;

do_while_
		: DO LBRACE function_body RBRACE WHILE LPAREN a RPAREN SEMI
			{ $$ = new yy.DoWhileJV(this._$.first_line + yy.line, this._$.first_column, $7, $3); }
		;
/* while and do-while */

/* switch-case */
switch_
		: SWITCH LPAREN a RPAREN LBRACE switch_opt RBRACE
			{ $$ = new yy.SwitchJV(this._$.first_line + yy.line, this._$.first_column, $3, $6); }
		;

switch_opt
		: list_case { $$ = $1; }
		| list_case default_ { $$ = [...$1, $2]; }
		| default_ { $$ = [$1]; }
		| { $$ = []; }
		;

list_case
		: list_case case_ { $1.push($2); $$ = $1; }
		| case_ { $$ = [$1]; }
		;

case_
		: CASE a COLON function_body
			{ $$ = new yy.CaseJV(this._$.first_line + yy.line, this._$.first_column, $4, $2); }
		;

default_
		: DEFAULT COLON function_body
			{ $$ = new yy.CaseJV(this._$.first_line + yy.line, this._$.first_column, $3, null); }
		;
/* switch-case */

/* print and println */
print_
		: PRINT LPAREN list_op RPAREN SEMI
			{ $$ = new yy.PrintJV(this._$.first_line + yy.line, this._$.first_column, false, $3); }
		| PRINTLN LPAREN list_op RPAREN SEMI
			{ $$ = new yy.PrintJV(this._$.first_line + yy.line, this._$.first_column, true, $3); }
		;

list_op
		: list_op COMMA a { $1.push($3); $$ = $1; }
		| a { $$ = [$1]; }
		;
/* print and println */

/* break, continue, return */
break_
		: BREAK SEMI
			{ $$ = new yy.Break(this._$.first_line + yy.line, this._$.first_column); }
		;

continue_
		: CONTINUE SEMI
			{ $$ = new yy.Continue(this._$.first_line + yy.line, this._$.first_column); }
		;

return_
		: RETURN a SEMI
			{ $$ = new yy.ReturnJV(this._$.first_line + yy.line, this._$.first_column, $2); }
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
		: a OR b { $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.OR, $1, $3); }
		| b { $$ = $1; }
		;

b
		: b AND c { $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.AND, $1, $3); }
		| c { $$ = $1; }
		;

c
		: c EQEQ d { $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.EQEQ, $1, $3); }
		| c NEQ d { $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.NEQ, $1, $3); }
		| c GREATER d { $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.GREATER, $1, $3); }
		| c GREATER_EQ d { $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.GREATER_EQ, $1, $3); }
		| c SMALLER d { $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.SMALLER, $1, $3); }
		| c SMALLER_EQ d { $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.SMALLER_EQ, $1, $3); }
		| d { $$ = $1; }
		;

d
		: d PLUS e { $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.SUM, $1, $3); }
		| d MINUS e { $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.SUB, $1, $3); }
		| e { $$ = $1; }
		;

e
		: e TIMES f { $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.MUL, $1, $3); }
		| e DIVIDE f { $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.DIV, $1, $3); }
		| e MOD f { $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.MOD, $1, $3); }
		| f { $$ = $1; }
		;

f
		: g POW f { $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.POW, $1, $3); }
		| g { $$ = $1; }
		;

g
		: MINUS h { $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.UMINUS, $2, null); }
		| h { $$ = $1; }
		;

h
		: NOT h { $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.NOT, $2, null); }
		| i { $$ = $1; }
		;

i
		: INTEGER { const tmp1 = new yy.Variable(yy.OperationType.INT, null, $1); $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.INT, tmp1); }
		| DECIMAL { const tmp2 = new yy.Variable(yy.OperationType.FLOAT, null, $1); $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.FLOAT, tmp2); }
		| STRING { const tmp3 = new yy.Variable(yy.OperationType.STRING, null, $1); $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.STRING, tmp3); }
		| CHAR { const tmp6 = new yy.Variable(yy.OperationType.CHAR, null, $1); $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.CHAR, tmp6); }
		| BOOL { const tmp4 = new yy.Variable(yy.OperationType.BOOL, null, $1); $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.BOOL, tmp4); }
		| ID { const tmp5 = new yy.Variable(yy.OperationType.ID, $1, null); $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.ID, tmp5); }
		| LPAREN a RPAREN { $$ = $2; }
		| THIS DOT ID { const tmp7 = new yy.Variable(yy.OperationType.ID, $3, null); $$ = new yy.OperationJV(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.ID, tmp7); $$.ths = true; }
		| SUPER DOT ID // herencia
		| function_call //  llamada de funciones
		;
/* operaciones logicas y aritmeticas */
