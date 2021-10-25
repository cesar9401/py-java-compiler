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

void Test_Test_int_int();
void Test_int_getSuma();
void Test_int_getResta();
void Test_void_getResult();
void Test_int_factorial_int();
void Test_int_ackerman_int_int();

int main() {
	stack_n[ptr_n] = 100;
	int t1 = ptr + 0;
	stack[t1] = ptr_n;
	ptr_n = ptr_n + 1;
	int t2 = ptr + 2;
	int t3 = t2 + 1;
	stack_n[ptr_n] = 125;
	stack[t3] = ptr_n;
	ptr_n = ptr_n + 1;
	int t5 = 200 - 100;
	int t6 = t5 / 2;
	int t4 = t2 + 2;
	stack_n[ptr_n] = t6;
	stack[t4] = ptr_n;
	ptr_n = ptr_n + 1;
	ptr = ptr + 2;
	Test_Test_int_int();
	ptr = ptr - 2;
	int t7 = ptr + 2;
	int t8 = stack[t7];
	int t9 = ptr + 1;
	stack[t9] = t8;
	printf("Iniciando, presione una tecla :D\n");
	int t10 = ptr + 2;
	stack[t10] = ptr_n;
	ptr_n = ptr_n + 1;
	int t11 = ptr + 3;
	stack[t11] = ptr_n;
	ptr_n = ptr_n + 1;
	printf("Ingrese un numero ");
	int t12;
	scanf("%d", &t12);
	int t13 = ptr + 2;
	int t14 = stack[t13];
	stack_n[t14] = t12;
	printf("Ingrese otro numero ");
	int t15;
	scanf("%d", &t15);
	int t16 = ptr + 3;
	int t17 = stack[t16];
	stack_n[t17] = t15;
	int t18 = ptr + 2;
	int t19 = stack[t18];
	int t20 = stack_n[t19];
	printf("Los numeros ingresados son: a = %d", t20);
	int t21 = ptr + 3;
	int t22 = stack[t21];
	int t23 = stack_n[t22];
	printf(", b = %d", t23);
	printf("\n");
	int t24 = ptr + 5;
	int t25 = ptr + 1;
	int t26 = stack[t25];
	stack[t24] = t26;
	int t28 = ptr + 5;
	int t29 = ptr + 1;
	int t30 = stack[t29];
	stack[t28] = t30;
	int t31 = t28 + 1;
	stack_n[ptr_n] = 3;
	stack[t31] = ptr_n;
	ptr_n = ptr_n + 1;
	ptr = ptr + 5;
	Test_int_factorial_int();
	ptr = ptr - 5;
	int t32 = ptr + 5;
	int t33 = t32 + 2;
	int t34 = stack[t33];
	int t35 = stack_n[t34];
	int t27 = t24 + 1;
	stack_n[ptr_n] = t35;
	stack[t27] = ptr_n;
	ptr_n = ptr_n + 1;
	ptr = ptr + 5;
	Test_int_factorial_int();
	ptr = ptr - 5;
	int t36 = ptr + 5;
	int t37 = t36 + 2;
	int t38 = stack[t37];
	int t39 = stack_n[t38];
	stack_n[ptr_n] = t39;
	int t40 = ptr + 4;
	stack[t40] = ptr_n;
	ptr_n = ptr_n + 1;
	int t41 = ptr + 4;
	int t42 = stack[t41];
	int t43 = stack_n[t42];
	printf("El resultado es: %d", t43);
	printf("\n");
	printf("Fin ejecucion :D\n");

	return 0;
}

void Test_Test_int_int() {
	int t1 = ptr + 0;
	stack[t1] = h;
	int t2 = h + 0;
	heap[t2] = ptr_n;
	ptr_n = ptr_n + 1;
	int t3 = h + 1;
	heap[t3] = ptr_n;
	ptr_n = ptr_n + 1;
	h = h + 2;
	int t4 = ptr + 1;
	int t5 = stack[t4];
	int t6 = stack_n[t5];
	int t7 = ptr + 0;
	int t8 = stack[t7];
	int t9 = t8 + 0;
	int t10 = heap[t9];
	stack_n[t10] = t6;
	int t11 = ptr + 2;
	int t12 = stack[t11];
	int t13 = stack_n[t12];
	int t14 = ptr + 0;
	int t15 = stack[t14];
	int t16 = t15 + 1;
	int t17 = heap[t16];
	stack_n[t17] = t13;
	int t18 = ptr + 4;
	int t19 = ptr + 0;
	int t20 = stack[t19];
	stack[t18] = t20;
	ptr = ptr + 4;
	Test_int_getSuma();
	ptr = ptr - 4;
	int t21 = ptr + 4;
	int t22 = t21 + 1;
	int t23 = stack[t22];
	int t24 = stack_n[t23];
	int t25 = ptr + 4;
	int t26 = ptr + 0;
	int t27 = stack[t26];
	stack[t25] = t27;
	ptr = ptr + 4;
	Test_int_getSuma();
	ptr = ptr - 4;
	int t28 = ptr + 4;
	int t29 = t28 + 1;
	int t30 = stack[t29];
	int t31 = stack_n[t30];
	int t32 = t24 + t31;
	stack_n[ptr_n] = t32;
	int t33 = ptr + 3;
	stack[t33] = ptr_n;
	ptr_n = ptr_n + 1;
	printf("%s", "El valor de la suma es");
	printf("%c", 32);
	int t34 = ptr + 3;
	int t35 = stack[t34];
	int t36 = stack_n[t35];
	printf("%d", t36);
	printf("\n");
}

void Test_int_getSuma() {
	int t37 = ptr + 1;
	int t38 = ptr + 0;
	int t39 = stack[t38];
	int t40 = t39 + 0;
	int t41 = heap[t40];
	int t42 = stack_n[t41];
	int t43 = ptr + 0;
	int t44 = stack[t43];
	int t45 = t44 + 1;
	int t46 = heap[t45];
	int t47 = stack_n[t46];
	int t48 = t42 + t47;
	stack_n[ptr_n] = t48;
	stack[t37] = ptr_n;
	ptr_n = ptr_n + 1;
	goto L1;

	L1:
}

void Test_int_getResta() {
	int t49 = ptr + 2;
	stack_n[ptr_n] = 10;
	int t50 = ptr + 1;
	stack[t50] = ptr_n;
	ptr_n = ptr_n + 1;

	L2:
	int t51 = ptr + 1;
	int t52 = stack[t51];
	int t53 = stack_n[t52];
	if(t53 > 0) goto L3;
	goto L4;

	L3:
	int t54 = ptr + 1;
	int t55 = stack[t54];
	int t56 = stack_n[t55];
	int t57 = t56 - 1;
	int t58 = ptr + 1;
	int t59 = stack[t58];
	stack_n[t59] = t57;
	int t60 = ptr + 1;
	int t61 = stack[t60];
	int t62 = stack_n[t61];
	if(t62 == 4) goto L6;
	goto L7;

	L6:
	goto L4;
	goto L5;

	L7:

	L5:
	goto L2;

	L4:
	int t63 = ptr + 0;
	int t64 = stack[t63];
	int t65 = t64 + 0;
	int t66 = heap[t65];
	int t67 = stack_n[t66];
	int t68 = ptr + 0;
	int t69 = stack[t68];
	int t70 = t69 + 1;
	int t71 = heap[t70];
	int t72 = stack_n[t71];
	int t73 = t67 - t72;
	stack_n[ptr_n] = t73;
	stack[t49] = ptr_n;
	ptr_n = ptr_n + 1;
	goto L8;

	L8:
}

void Test_void_getResult() {
	int t74 = ptr + 0;
	int t75 = stack[t74];
	int t76 = t75 + 0;
	int t77 = heap[t76];
	int t78 = stack_n[t77];
	printf("%d", t78);
	printf("%c", 32);
	int t79 = ptr + 0;
	int t80 = stack[t79];
	int t81 = t80 + 1;
	int t82 = heap[t81];
	int t83 = stack_n[t82];
	printf("%d", t83);
	printf("\n");
	stack_n[ptr_n] = 0;
	int t84 = ptr + 1;
	stack[t84] = ptr_n;
	ptr_n = ptr_n + 1;

	L9:
	int t85 = ptr + 1;
	int t86 = stack[t85];
	int t87 = stack_n[t86];
	if(t87 < 10) goto L10;
	goto L11;

	L10:
	int t88 = ptr + 1;
	int t89 = stack[t88];
	int t90 = stack_n[t89];
	if(t90 == 2) goto L14;
	goto L15;

	L14:
	goto L12;
	goto L13;

	L15:
	int t91 = ptr + 1;
	int t92 = stack[t91];
	int t93 = stack_n[t92];
	if(t93 == 5) goto L16;
	goto L17;

	L16:
	goto L11;
	goto L13;

	L17:

	L13:
	printf("%s", "Iteracion:");
	printf("%c", 32);
	int t94 = ptr + 1;
	int t95 = stack[t94];
	int t96 = stack_n[t95];
	printf("%d", t96);
	printf("\n");

	L12:
	int t97 = ptr + 1;
	int t98 = stack[t97];
	int t99 = stack_n[t98];
	int t100 = t99 + 1;
	int t101 = ptr + 1;
	int t102 = stack[t101];
	stack_n[t102] = t100;
	goto L9;

	L11:
}

void Test_int_factorial_int() {
	int t103 = ptr + 2;
	int t104 = ptr + 1;
	int t105 = stack[t104];
	int t106 = stack_n[t105];
	if(t106 < 0) goto L19;
	goto L20;

	L19:
	int t107 = -1 * 1;
	stack_n[ptr_n] = t107;
	stack[t103] = ptr_n;
	ptr_n = ptr_n + 1;
	goto L23;
	goto L18;

	L20:
	int t108 = ptr + 1;
	int t109 = stack[t108];
	int t110 = stack_n[t109];
	if(t110 <= 1) goto L21;
	goto L22;

	L21:
	stack_n[ptr_n] = 1;
	stack[t103] = ptr_n;
	ptr_n = ptr_n + 1;
	goto L23;
	goto L18;

	L22:
	int t111 = ptr + 1;
	int t112 = stack[t111];
	int t113 = stack_n[t112];
	int t114 = ptr + 3;
	int t115 = ptr + 0;
	int t116 = stack[t115];
	stack[t114] = t116;
	int t118 = ptr + 1;
	int t119 = stack[t118];
	int t120 = stack_n[t119];
	int t121 = t120 - 1;
	int t117 = t114 + 1;
	stack_n[ptr_n] = t121;
	stack[t117] = ptr_n;
	ptr_n = ptr_n + 1;
	ptr = ptr + 3;
	Test_int_factorial_int();
	ptr = ptr - 3;
	int t122 = ptr + 3;
	int t123 = t122 + 2;
	int t124 = stack[t123];
	int t125 = stack_n[t124];
	int t126 = t113 * t125;
	stack_n[ptr_n] = t126;
	stack[t103] = ptr_n;
	ptr_n = ptr_n + 1;
	goto L23;
	goto L18;

	L18:

	L23:
}

void Test_int_ackerman_int_int() {
	int t127 = ptr + 3;
	int t128 = ptr + 1;
	int t129 = stack[t128];
	int t130 = stack_n[t129];
	if(t130 == 0) goto L25;
	goto L26;

	L25:
	int t131 = ptr + 2;
	int t132 = stack[t131];
	int t133 = stack_n[t132];
	int t134 = t133 + 1;
	stack_n[ptr_n] = t134;
	stack[t127] = ptr_n;
	ptr_n = ptr_n + 1;
	goto L30;
	goto L24;

	L26:
	int t135 = ptr + 1;
	int t136 = stack[t135];
	int t137 = stack_n[t136];
	if(t137 > 0) goto L27;
	goto L28;

	L27:
	int t138 = ptr + 2;
	int t139 = stack[t138];
	int t140 = stack_n[t139];
	if(t140 == 0) goto L29;
	goto L28;

	L29:
	int t141 = ptr + 4;
	int t142 = ptr + 0;
	int t143 = stack[t142];
	stack[t141] = t143;
	int t145 = ptr + 1;
	int t146 = stack[t145];
	int t147 = stack_n[t146];
	int t148 = t147 - 1;
	int t144 = t141 + 1;
	stack_n[ptr_n] = t148;
	stack[t144] = ptr_n;
	ptr_n = ptr_n + 1;
	int t149 = t141 + 2;
	stack_n[ptr_n] = 1;
	stack[t149] = ptr_n;
	ptr_n = ptr_n + 1;
	ptr = ptr + 4;
	Test_int_ackerman_int_int();
	ptr = ptr - 4;
	int t150 = ptr + 4;
	int t151 = t150 + 3;
	int t152 = stack[t151];
	int t153 = stack_n[t152];
	stack_n[ptr_n] = t153;
	stack[t127] = ptr_n;
	ptr_n = ptr_n + 1;
	goto L30;
	goto L24;

	L28:
	int t154 = ptr + 5;
	int t155 = ptr + 0;
	int t156 = stack[t155];
	stack[t154] = t156;
	int t158 = ptr + 1;
	int t159 = stack[t158];
	int t160 = stack_n[t159];
	int t157 = t154 + 1;
	stack_n[ptr_n] = t160;
	stack[t157] = ptr_n;
	ptr_n = ptr_n + 1;
	int t162 = ptr + 2;
	int t163 = stack[t162];
	int t164 = stack_n[t163];
	int t165 = t164 - 1;
	int t161 = t154 + 2;
	stack_n[ptr_n] = t165;
	stack[t161] = ptr_n;
	ptr_n = ptr_n + 1;
	ptr = ptr + 5;
	Test_int_ackerman_int_int();
	ptr = ptr - 5;
	int t166 = ptr + 5;
	int t167 = t166 + 3;
	int t168 = stack[t167];
	int t169 = stack_n[t168];
	stack_n[ptr_n] = t169;
	int t170 = ptr + 3;
	stack[t170] = ptr_n;
	ptr_n = ptr_n + 1;
	int t171 = ptr + 5;
	int t172 = ptr + 0;
	int t173 = stack[t172];
	stack[t171] = t173;
	int t175 = ptr + 1;
	int t176 = stack[t175];
	int t177 = stack_n[t176];
	int t178 = t177 - 1;
	int t174 = t171 + 1;
	stack_n[ptr_n] = t178;
	stack[t174] = ptr_n;
	ptr_n = ptr_n + 1;
	int t180 = ptr + 3;
	int t181 = stack[t180];
	int t182 = stack_n[t181];
	int t179 = t171 + 2;
	stack_n[ptr_n] = t182;
	stack[t179] = ptr_n;
	ptr_n = ptr_n + 1;
	ptr = ptr + 5;
	Test_int_ackerman_int_int();
	ptr = ptr - 5;
	int t183 = ptr + 5;
	int t184 = t183 + 3;
	int t185 = stack[t184];
	int t186 = stack_n[t185];
	stack_n[ptr_n] = t186;
	stack[t127] = ptr_n;
	ptr_n = ptr_n + 1;
	goto L30;
	goto L24;

	L24:

	L30:
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
