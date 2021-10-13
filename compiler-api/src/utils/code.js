function get3dCode(quads) {
    let result = `
/*
*
* compilar con:
* gcc output.c -o output.out -lm
* by: cesar31
* https://github.com/cesar9401
*
*
*/

#include<stdio.h>
#include<math.h>
#include <stdlib.h>
#include <termios.h>

static struct termios old, new;

int stack[3000];
int stack_n[1000];
char stack_c[1000];
float stack_f[1000];

int ptr = 0;
int ptr_n = 0;
int ptr_c = 0;
int ptr_f = 0;

void initTermios();
void resetTermios();
void getch();

int main() {

`;

    for (const q of quads) {
        let type = q.type ? q.type.toLowerCase() + ' ' : "";
        type = type === 'boolean ' ? 'int ' : type;
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
            case "FUNCTION":
                result += `\t${q.result}();\n`;
                break;
        }
    }

	result += `
    return 0;
\n}\n`;

    result += `
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
    int t1 = ptr + 0; // reservar lugar para ch
    stack[t1] = ptr_c;
    ptr_c = ptr_c + 1;

    initTermios();
    char t2 = getchar();

    // almacenar t2 en la pila
    int t4 = stack[t1];
    stack_c[t4] = t2;
    resetTermios();
}
`

	return result;
}

module.exports = get3dCode;
