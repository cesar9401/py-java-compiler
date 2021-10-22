function get3dCode(quads) {
    let result = `/*
*
* compilar con:
* gcc output.c -o output.out -lm
* by: cesar31
* https://github.com/cesar9401
*
*
*/

#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <termios.h>
#include <string.h>

static struct termios old, new;

int stack[3000];
int stack_n[1000];
char stack_c[1000];
float stack_f[1000];
char* stack_s[1000];

/* heap */
int heap[3000];

int ptr = 0;
int ptr_n = 0;
int ptr_c = 0;
int ptr_f = 0;
int ptr_s = 0;

int h = 0;

void initTermios();
void resetTermios();
void getch();
void __concat__();

int main() {

`;

    for (const q of quads) {
        let type = q.type ? q.type.toLowerCase() + ' ' : "";
        if(type === 'boolean ') {
            type = 'int '
        } else if(type === 'string ') {
            type = 'char* '
        }
        switch (q.op) {
            case "PLUS":
                result += `\t${type}${q.result} = ${q.arg1} + ${q.arg2};\n`;
                break;
            case "TIMES":
                result += `\t${type}${q.result} = ${q.arg1} * ${q.arg2};\n`;
                break;
            case "DIVIDE":
                result += `\t${type}${q.result} = ${q.arg1} / ${q.arg2};\n`;
                break;
            case "MINUS":
                result += `\t${type}${q.result} = ${q.arg1} - ${q.arg2};\n`;
                break;
            case "MOD":
                result += `\t${type}${q.result} = ${q.arg1} % ${q.arg2};\n`;
                break;
            case "POW":
                result += `\t${type}${q.result} = pow(${q.arg1}, ${q.arg2});\n`;
                break;
            case "UMINUS":
                result += `\t${type}${q.result} = -1 * ${q.arg1};\n`;
                break;
			case "ASSIGN":
				result += `\t${type}${q.result} = ${q.arg1};\n`;
				break;
			case "LABEL":
				result += `\n\t${q.result}:\n`;
				break;
			case "IF_EQEQ":
				result += `\tif(${q.arg1} == ${q.arg2}) goto ${q.result};\n`;
				break;
            case "IF_NEQ":
				result += `\tif(${q.arg1} != ${q.arg2}) goto ${q.result};\n`;
                break;
            case "IF_GREATER":
				result += `\tif(${q.arg1} > ${q.arg2}) goto ${q.result};\n`;
                break;
            case "IF_GREATER_EQ":
				result += `\tif(${q.arg1} >= ${q.arg2}) goto ${q.result};\n`;
                break;
            case "IF_SMALLER":
				result += `\tif(${q.arg1} < ${q.arg2}) goto ${q.result};\n`;
                break;
            case "IF_SMALLER_EQ":
				result += `\tif(${q.arg1} <= ${q.arg2}) goto ${q.result};\n`;
                break;
			case "GOTO":
				result += `\tgoto ${q.result};\n`;
				break;
			case "PRINTF":
				if(q.arg2) {
					result += `\tprintf("${q.arg1}", ${q.arg2});\n`;
				} else {
					result += `\tprintf("${q.arg1}");\n`;
				}
				break;
            case "SCANF":
                result += `\t${type}${q.result};\n`;
                result += `\tscanf("${q.arg1}", &${q.result});\n`;
                break;
            case "CLEAR":
                result += `\tsystem("clear");\n`;
                break;
            case "ARRAY":
                result += `\t${type}${q.result};\n`;
                break;
            case "SPRINTF":
                result += `\tsprintf(${q.arg1}, ${q.arg2}, ${q.result});\n`;
                break;
            case "FUNCTION":
                result += `\t${q.result}();\n`;
                break;
        }
    }

	result += `
    return 0;
\n}\n`;

    result += `
/* function getch on linux */
/* Initialize new terminal i/o settings */
void initTermios() {
    tcgetattr(0, &old); //grab old terminal i/o settings
    new = old; //make new settings same as old settings
    new.c_lflag &= ~ICANON; //disable buffered i/o
    new.c_lflag &= 0 ? ECHO : ~ECHO; //set echo mode
    tcsetattr(0, TCSANOW, &new); //apply terminal io settings
}

/* Restore old terminal i/o settings */
void resetTermios() {
    tcsetattr(0, TCSANOW, &old);
}

void getch() {
    int t1 = ptr + 0; // reservar lugar para el caracter leido por getchar()
    stack[t1] = ptr_c;
    ptr_c = ptr_c + 1;

    initTermios();
    char t2 = getchar();

    // almacenar t2 en stack
    int t4 = stack[t1];
    stack_c[t4] = t2;
    resetTermios();
}
/* function getch on linux */

/* concatenar dos strings */
void __concat__() {
    /* string 1 */
    int t1 = ptr + 0;
    int t2 = stack[t1];
    char* t3 = stack_s[t2];

    /* string 2 */
    int t4 = ptr + 1;
    int t5 = stack[t4];
    char* t6 = stack_s[t5];

    int t7 = strlen(t3);
    int t8 = strlen(t6);
    int t9 = t7 + t8;
    char* t10 = malloc(sizeof(char) * t9);

    strcpy(t10, t3); // copy t3 on t10
    strcat(t10, t6); // concat t6 at end of t10

    /* return */
    stack_s[ptr_s] = t10;
    int t11 = ptr + 2;
    stack[t11] = ptr_s;
    ptr_s = ptr_s + 1; // aumentar puntero en stack_s
}
/* concatenar dos strings */
`

    return result;
}

module.exports = get3dCode;
