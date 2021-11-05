/*
*
* compilar con:
* gcc project.c -o project.out -lm
* ejecutar con:
* ./project.out
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

int stack[5000];
int stack_n[10000];
char stack_c[10000];
float stack_f[10000];
char* stack_s[10000];

/* heap */
int heap[5000];

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
	stack_n[ptr_n] = 256;
	int t1 = ptr + 0;
	stack[t1] = ptr_n;
	ptr_n = ptr_n + 1;
	int t2 = ptr + 1;
	stack[t2] = ptr_n;
	int t3 = ptr + 2;
	stack[t3] = 10;
	int t4 = ptr + 2;
	int t5 = stack[t4];
	ptr_n = ptr_n + t5;
	int t6 = ptr + 3;
	stack[t6] = ptr_c;
	int t7 = ptr + 0;
	int t8 = stack[t7];
	int t9 = stack_n[t8];
	int t10 = ptr + 4;
	stack[t10] = t9;
	int t11 = ptr + 4;
	int t12 = stack[t11];
	ptr_c = ptr_c + t12;
	stack_n[ptr_n] = 0;
	int t13 = ptr + 5;
	stack[t13] = ptr_n;
	ptr_n = ptr_n + 1;

	L1:
	int t14 = ptr + 5;
	int t15 = stack[t14];
	int t16 = stack_n[t15];
	if(t16 < 10) goto L2;
	goto L3;

	L2:
	int t17 = ptr + 5;
	int t18 = stack[t17];
	int t19 = stack_n[t18];
	int t20 = ptr + 5;
	int t21 = stack[t20];
	int t22 = stack_n[t21];
	int t23 = ptr + 1;
	int t24 = stack[t23];
	int t25 = t24 + t22;
	stack_n[t25] = t19;

	L4:
	int t26 = ptr + 5;
	int t27 = stack[t26];
	int t28 = stack_n[t27];
	int t29 = t28 + 1;
	int t30 = ptr + 5;
	int t31 = stack[t30];
	stack_n[t31] = t29;
	goto L1;

	L3:
	int t32 = ptr + 5;
	stack[t32] = ptr_n;
	int t33 = ptr + 6;
	stack[t33] = 10;
	int t34 = ptr + 7;
	stack[t34] = 10;
	int t35 = ptr + 8;
	stack[t35] = 5;
	int t36 = ptr + 9;
	stack[t36] = 8;
	int t37 = ptr + 6;
	int t38 = stack[t37];
	int t39 = ptr + 7;
	int t40 = stack[t39];
	int t41 = t38 * t40;
	int t42 = ptr + 8;
	int t43 = stack[t42];
	int t44 = t41 * t43;
	int t45 = ptr + 9;
	int t46 = stack[t45];
	int t47 = t44 * t46;
	ptr_n = ptr_n + t47;
	int t48 = ptr + 7;
	int t49 = stack[t48];
	int t50 = ptr + 1;
	int t51 = stack[t50];
	int t52 = t51 + 4;
	int t53 = stack_n[t52];
	int t54 = t53 * t49;
	int t56 = ptr + 1;
	int t57 = stack[t56];
	int t58 = t57 + 5;
	int t59 = stack_n[t58];
	int t55 = t54 + t59;
	int t60 = ptr + 8;
	int t61 = stack[t60];
	int t62 = t55 * t61;
	int t63 = ptr + 1;
	int t64 = stack[t63];
	int t65 = t64 + 3;
	int t66 = stack_n[t65];
	int t67 = t62 + t66;
	int t68 = ptr + 9;
	int t69 = stack[t68];
	int t70 = t67 * t69;
	int t71 = ptr + 1;
	int t72 = stack[t71];
	int t73 = t72 + 3;
	int t74 = stack_n[t73];
	int t75 = t70 + t74;
	int t76 = ptr + 5;
	int t77 = stack[t76];
	int t78 = t77 + t75;
	stack_n[t78] = 1024;
	int t79 = ptr + 7;
	int t80 = stack[t79];
	int t81 = ptr + 1;
	int t82 = stack[t81];
	int t83 = t82 + 4;
	int t84 = stack_n[t83];
	int t85 = t84 * t80;
	int t87 = ptr + 1;
	int t88 = stack[t87];
	int t89 = t88 + 5;
	int t90 = stack_n[t89];
	int t86 = t85 + t90;
	int t91 = ptr + 8;
	int t92 = stack[t91];
	int t93 = t86 * t92;
	int t94 = ptr + 1;
	int t95 = stack[t94];
	int t96 = t95 + 3;
	int t97 = stack_n[t96];
	int t98 = t93 + t97;
	int t99 = ptr + 9;
	int t100 = stack[t99];
	int t101 = t98 * t100;
	int t102 = ptr + 1;
	int t103 = stack[t102];
	int t104 = t103 + 3;
	int t105 = stack_n[t104];
	int t106 = t101 + t105;
	int t107 = ptr + 5;
	int t108 = stack[t107];
	int t109 = t108 + t106;
	int t110 = stack_n[t109];
	printf("El numero es: %d", t110);
	printf("\n");
	stack_n[ptr_n] = 0;
	int t111 = ptr + 10;
	stack[t111] = ptr_n;
	ptr_n = ptr_n + 1;

	L5:
	int t112 = ptr + 10;
	int t113 = stack[t112];
	int t114 = stack_n[t113];
	int t115 = ptr + 0;
	int t116 = stack[t115];
	int t117 = stack_n[t116];
	if(t114 < t117) goto L6;
	goto L7;

	L6:
	int t118 = ptr + 10;
	int t119 = stack[t118];
	int t120 = stack_n[t119];
	int t121 = ptr + 10;
	int t122 = stack[t121];
	int t123 = stack_n[t122];
	int t124 = ptr + 3;
	int t125 = stack[t124];
	int t126 = t125 + t123;
	stack_c[t126] = t120;

	L8:
	int t127 = ptr + 10;
	int t128 = stack[t127];
	int t129 = stack_n[t128];
	int t130 = t129 + 1;
	int t131 = ptr + 10;
	int t132 = stack[t131];
	stack_n[t132] = t130;
	goto L5;

	L7:
	stack_n[ptr_n] = 0;
	int t133 = ptr + 10;
	stack[t133] = ptr_n;
	ptr_n = ptr_n + 1;

	L9:
	int t134 = ptr + 10;
	int t135 = stack[t134];
	int t136 = stack_n[t135];
	int t137 = ptr + 0;
	int t138 = stack[t137];
	int t139 = stack_n[t138];
	if(t136 < t139) goto L10;
	goto L11;

	L10:
	int t140 = ptr + 10;
	int t141 = stack[t140];
	int t142 = stack_n[t141];
	printf("ascii %d", t142);
	int t143 = ptr + 10;
	int t144 = stack[t143];
	int t145 = stack_n[t144];
	int t146 = ptr + 3;
	int t147 = stack[t146];
	int t148 = t147 + t145;
	char t149 = stack_c[t148];
	printf(" -> %c", t149);
	printf("\n");

	L12:
	int t150 = ptr + 10;
	int t151 = stack[t150];
	int t152 = stack_n[t151];
	int t153 = t152 + 1;
	int t154 = ptr + 10;
	int t155 = stack[t154];
	stack_n[t155] = t153;
	goto L9;

	L11:

	return 0;
}

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
    char* t10 = malloc(sizeof(char) * t9 + 1);

    strcpy(t10, t3); // copy t3 on t10
    strcat(t10, t6); // concat t6 at end of t10

    /* return */
    stack_s[ptr_s] = t10;
    int t11 = ptr + 2;
    stack[t11] = ptr_s;
    ptr_s = ptr_s + 1; // aumentar puntero en stack_s
}
/* concatenar dos strings */
