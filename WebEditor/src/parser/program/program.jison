%{
	// write your code here
	let string = "";
	let char = "";
	let format = [];
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
// array							"arreglo"
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
// <INITIAL>{array}				return "ARRAY";
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

/* for scanf and printf */
<STRING>"%d"[^\n\r\"\\%]*		string += yytext; format.push("%d");
<STRING>"%c"[^\n\r\"\\%]*		string += yytext; format.push("%c");
<STRING>"%f"[^\n\r\"\\%]*		string += yytext; format.push("%f");

<STRING>[^\n\r\"\\%]+			string += yytext;
<STRING>\\t						string += "\\t";
<STRING>\\n						string += "\\n";
<STRING>\\\"					string += "\\\"";
<STRING>\\						string += "\\\\";

<STRING>"%"						string += "%";

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
		: program EOF
			{ return $1; }
		;

/* programa */
program
		: PROGRAM includes body
			{ $$ = [...$2, ...$3]; }
		;

body
		: body body_opt { $$ = [...$1, ...$2]; }
		| { $$ = []; }
		;

body_opt
		: const { $$ = [$1]; }
		| statement { $$ = [...$1]; }
		| array_statement { $$ = [$1]; }
		| assigment { $$ = [...$1]; }
		| class_statement { $$ = [$1]; }
		| main { $$ = [$1]; }
		;
/* programa */

/* includes */
includes
		: includes include { $1.push($2); $$ = $1; }
		| { $$ = []; }
		;

include
		: NUMERAL INCLUDE PY DOT TIMES SEMI /* todas las funciones en el archivo */
			{ $$ = new yy.Include(this._$.first_line + yy.line, this._$.first_column, $3, [], true); }
		| NUMERAL INCLUDE JAVA DOT TIMES SEMI /* todas las clases en el archivo */
			{ $$ = new yy.Include(this._$.first_line + yy.line, this._$.first_column, $3, [], true); }
		// JAVA
		| NUMERAL INCLUDE JAVA DOT dir SEMI /* clases java en file en dir */
			{ $$ = new yy.Include(this._$.first_line + yy.line, this._$.first_column, $3, $5, false); }
		| NUMERAL INCLUDE JAVA DOT dir DOT TIMES SEMI /* todas las clases java de los ficheros en dir */
			{ $$ = new yy.Include(this._$.first_line + yy.line, this._$.first_column, $3, $5, true); }
		// PY
		| NUMERAL INCLUDE PY DOT dir SEMI /* funciones py en ficher dir */
			{ $$ = new yy.Include(this._$.first_line + yy.line, this._$.first_column, $3, $5, false); }
		| NUMERAL INCLUDE PY DOT dir DOT TIMES SEMI /* todas las funciones de todos los ficheros en dir */
			{ $$ = new yy.Include(this._$.first_line + yy.line, this._$.first_column, $3, $5, true); }
		;

dir
		: dir DOT ID { $1.push($3); $$ = $1; }
		| ID { $$ = [$1]; }
		;
/* includes */

/* main */
main
		: VOID MAIN LPAREN RPAREN LBRACE main_body RBRACE
			{ $$ = new yy.Main(this._$.first_line + yy.line, this._$.first_column, $6); }
		;

main_body
		: main_body main_b { $$ = [...$1, ...$2]; }
		| { $$ = []; }
		;

main_b
		: statement { $$ = [...$1]; }
		| assigment { $$ = [...$1]; }
		| class_statement { $$ = [$1]; }
		| array_statement { $$ = [$1]; }
		| list_if { $$ = [$1]; }
		| while_ { $$ = [$1]; }
		| do_while_ { $$ = [$1]; }
		| continue_ { $$ = [$1]; }
		| break_ { $$ = [$1]; }
		| for_ { $$ = [$1]; }
		| switch_ { $$ = [$1]; }
		| function_call SEMI { $$ = [$1]; }
		| clear_ { $$ = [$1]; }
		| getch_ SEMI { $$ = [$1]; }
		| printf_ { $$ = [$1]; }
		| scanf_ { $$ = [$1]; }
		// | error SEMI
		// | const
		;
/* main */

/* constantes */
const
		: CONST type ID EQUAL a SEMI
			{ $$ = new yy.Statement(this._$.first_line + yy.line, this._$.first_column, true, $2, $3, $5); }
		;
/* constantes */

/* array statement */
array_statement
		: type ID dimensions SEMI
			{ $$ = new yy.ArrayStatement(this._$.first_line + yy.line, this._$.first_column, $1, $2, $3); }
		;

dimensions
		: dimensions dimension { $1.push($2); $$ = $1; }
		| dimension { $$ = [$1]; }
		;

dimension
		: LBRACKET a RBRACKET { $$ = $2; }
		;
/* array statement */

/* statement */
statement
		: type list_opt SEMI
			%{
				$$ = [];
				for(const element of $2) {
					if(element.length === 1) {
						const tmp = new yy.Statement(this._$.first_line + yy.line, this._$.first_column, false, $1, element[0], null);
						$$.push(tmp);
					} else if(element.length === 2) {
						const tmp = new yy.Statement(this._$.first_line + yy.line, this._$.first_column, false, $1, element[0], element[1]);
						$$.push(tmp);
					}
				}
			%}
		;

list_opt
		: list_opt COMMA option { $1.push($3); $$ = $1; }
		| option { $$ = []; $$.push($1); }
		;

option
		: ID EQUAL a { $$ = [$1, $3]; }
		| ID { $$ = [$1]; }
		;
/* statement */

/* assignment */
assigment
		: list_assign SEMI
			{ $$ = $1; }
		;

list_assign
		: list_assign COMMA assign
			{ $1.push($3); $$ = $1; }
		| assign
			{ $$ = []; $$.push($1); }
		;

assign
		: ID EQUAL a
			{ $$ = new yy.Assignment(this._$.first_line + yy.line, this._$.first_column, $1, $3); }
		| ID dimensions EQUAL a
			{ $$ = new yy.ArrayAssignment(this._$.first_line + yy.line, this._$.first_column, new yy.ArrayAccess($1, $2), $4); }
		;
/* assignment */

/* tipos de variables */
type
		: INT { $$ = yy.OperationType.INT; }
		| CHAR { $$ = yy.OperationType.CHAR; }
		| FLOAT { $$ = yy.OperationType.FLOAT; }
		;
/* tipos de variables */

/* class statement */
class_statement
		/* sin parametros */
		: JAVA DOT ID list_id SEMI
			{ $$ = new yy.CreateClass(this._$.first_line + yy.line, this._$.first_column, $3, $4, []); }
		/* con parametros */
		| JAVA DOT ID ID LPAREN param RPAREN SEMI
			{ $$ = new yy.CreateClass(this._$.first_line + yy.line, this._$.first_column, $3, [$4], $6); }
		;

list_id
		: list_id COMMA ID { $1.push($3); $$ = $1; }
		| ID { $$ = [$1]; }
		;

param
		: param COMMA a { $1.push($3); $$ = $1; }
		| a { $$ = []; $$.push($1); }
		;
/* class statement */

/* if, else-if and else */
list_if
		: if_ { $$ = new yy.IfInstruction(this._$.first_line + yy.line, this._$.first_column, [$1]); }
		| if_ else_ { $$ = new yy.IfInstruction(this._$.first_line + yy.line, this._$.first_column, [$1, $2]); }
		| if_ list_else_if { $$ = new yy.IfInstruction(this._$.first_line + yy.line, this._$.first_column, [$1, ...$2]); }
		| if_ list_else_if else_ { $$ = new yy.IfInstruction(this._$.first_line + yy.line, this._$.first_column, [$1, ...$2, $3]); }
		;

if_
		: IF LPAREN a RPAREN LBRACE main_body RBRACE
			{ $$ = new yy.If(this._$.first_line + yy.line, this._$.first_column, "IF", $6, $3); }
		;

else_
		: ELSE LBRACE main_body RBRACE
			{ $$ = new yy.If(this._$.first_line + yy.line, this._$.first_column, "ELSE", $3, null); }
		;

list_else_if
		: list_else_if else_if { $1.push($2); $$ = $1; }
		| else_if { $$ = []; $$.push($1); }
		;

else_if
		: ELSE IF LPAREN a RPAREN LBRACE main_body RBRACE
			{ $$ = new yy.If(this._$.first_line + yy.line, this._$.first_column, "ELSE_IF", $7, $4); }
		;
/* if, else-if and else */

/* while and do-while */
while_
		: WHILE LPAREN a RPAREN LBRACE main_body RBRACE
			{ $$ = new yy.While(this._$.first_line + yy.line, this._$.first_column, $3, $6); }
		;

do_while_
		: DO LBRACE main_body RBRACE WHILE LPAREN a RPAREN SEMI
			{ $$ = new yy.DoWhile(this._$.first_line + yy.line, this._$.first_column, $7, $3); }
		;
/* while and do-while */

/* for */
for_
		: FOR LPAREN INT ID EQUAL a SEMI a SEMI assign RPAREN LBRACE main_body RBRACE
			%{
				const tmp_s = new yy.Statement(this._$.first_line + yy.line, this._$.first_column, false, yy.OperationType.INT, $4, $6);
				$$ = new yy.For(this._$.first_line + yy.line, this._$.first_column, $8, $10, $13, tmp_s, null);
			%}
		| FOR LPAREN assign SEMI a SEMI assign RPAREN LBRACE main_body RBRACE
			{ $$ = new yy.For(this._$.first_line + yy.line, this._$.first_column, $5, $7, $10, null, $3); }
		;

// for_assign
// 		: INT ID EQUAL a { $$ = new yy.Statement(this._$.first_line + yy.line, this._$.first_column, false, yy.OperationType.INT, $2, $4); }
// 		| assign { $$ = $1; }
// 		;
/* for */

/* switch-case */
switch_
		: SWITCH LPAREN a RPAREN LBRACE switch_opt RBRACE
			{ $$ = new yy.Switch(this._$.first_line + yy.line, this._$.first_column, $3, $6); }
		;

switch_opt
		: list_case { $$ = $1; }
		| list_case default_ { $$ = [...$1, $2]; }
		| default_ { $$ = [$1]; }
		| { $$ = []; }
		;

list_case
		: list_case case_ { $1.push($2); $$ = $1; }
		| case_ { $$ = []; $$.push($1); }
		;

case_
		: CASE a COLON main_body
			{ $$ = new yy.Case(this._$.first_line + yy.line, this._$.first_column, $4, $2); }
		;

default_
		: DEFAULT COLON main_body
			{ $$ = new yy.Case(this._$.first_line + yy.line, this._$.first_column, $3, null); }
		;
/* switch-case */

/* continue and break */
continue_
		: CONTINUE SEMI
			{ $$ = new yy.Continue(this._$.first_line + yy.line, this._$.first_column); }
		;

break_
		: BREAK SEMI
			{ $$ = new yy.Break(this._$.first_line + yy.line, this._$.first_column); }
		;
/* continue and break */

/* function call */
function_call
		: PY DOT ID LPAREN params RPAREN
			{ $$ = new yy.FunctionCall(this._$.first_line + yy.line, this._$.first_column, "PYTHON", "", $3, $5); }
		| JAVA DOT ID DOT ID LPAREN params RPAREN
			{ $$ = new yy.FunctionCall(this._$.first_line + yy.line, this._$.first_column, "JAVA", $3, $5, $7); }
		// | GETCH LPAREN RPAREN
		;

params
		: param	{ $$ = $1; }
		| {$$ = []; }
		;

getch_
		: GETCH LPAREN RPAREN
			{ $$ = new yy.Getch(this._$.first_line + yy.line, this._$.first_column, $1); }
		;

clear_
		: CLEAR LPAREN RPAREN SEMI
			{ $$ = new yy.Clear(this._$.first_line + yy.line, this._$.first_column); }
		;

printf_
		: PRINTF LPAREN STRING RPAREN SEMI
			{ $$ = new yy.Printf(this._$.first_line + yy.line, this._$.first_column, $3, [...format], null); format = []; }
		| PRINTF LPAREN STRING COMMA param RPAREN SEMI
			{ $$ = new yy.Printf(this._$.first_line + yy.line, this._$.first_column, $3, [...format], $5); format = []; }
		;

scanf_
		: SCANF LPAREN STRING COMMA AMP ID RPAREN SEMI
			{ $$ = new yy.Scanf(this._$.first_line + yy.line, this._$.first_column, $3, $6, format); format = []; }
		;
/* function call */

/* operaciones logicas y aritmeticas */
a
		: a OR b { $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.OR, $1, $3); }
		| b { $$ = $1; }
		;

b
		: b AND c { $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.AND, $1, $3); }
		| c { $$ = $1; }
		;

c
		: c EQEQ d { $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.EQEQ, $1, $3); }
		| c NEQ d { $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.NEQ, $1, $3); }
		| c GREATER d { $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.GREATER, $1, $3); }
		| c GREATER_EQ d { $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.GREATER_EQ, $1, $3); }
		| c SMALLER d { $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.SMALLER, $1, $3); }
		| c SMALLER_EQ d { $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.SMALLER_EQ, $1, $3); }
		| d { $$ = $1; }
		;

d
		: d PLUS e { $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.SUM, $1, $3); }
		| d MINUS e { $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.SUB, $1, $3); }
		| e { $$ = $1; }
		;

e
		: e TIMES f { $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.MUL, $1, $3); }
		| e DIVIDE f { $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.DIV, $1, $3); }
		| e MOD f { $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.MOD, $1, $3); }
		| f { $$ = $1; }
		;

f
		: g POW f { $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.POW, $1, $3); }
		| g { $$ = $1; }
		;

g
		: MINUS h { $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.UMINUS, $2, null); }
		| h { $$ = $1; }
		;

h
		: NOT h { $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.NOT, $2, null); }
		| i { $$ = $1; }
		;

i
		: INTEGER { const tmp = new yy.Variable(yy.OperationType.INT, null, $1); $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.INT, tmp); }
		| DECIMAL { const tmp1 = new yy.Variable(yy.OperationType.FLOAT, null, $1); $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.FLOAT, tmp1); }
		| CHAR { const tmp2 = new yy.Variable(yy.OperationType.CHAR, null, $1); $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.CHAR, tmp2); }
		| STRING { const tmp3 = new yy.Variable(yy.OperationType.STRING, null, $1); $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.STRING, tmp3); }
		// | BOOL
		| ID { const tmp4 = new yy.Variable(yy.OperationType.ID, $1, null); $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, yy.OperationType.ID, tmp4); }
		| LPAREN a RPAREN { $$ = $2; }
		| function_call { $$ = new yy.Operation(this._$.first_line + yy.line, this._$.first_column, $1); }
		| getch_
		/* array_access */
		| ID dimensions
			%{
				const op = new yy.Operation();
				op.line = this._$.first_line + yy.line;
				op.column = this._$.first_column;
				op.array = new yy.ArrayAccess($1, $2);
				$$ = op;
			%}
		;
/* operaciones logicas y aritmeticas */
