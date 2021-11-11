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

void __py__Saludo__();
void algo_algo();
void algo_int_holaMundo();
void algo_void_edadmeses_int_int();
void algo_int_factorial_int();

int main() {
	stack_n[ptr_n] = 10;
	int t1 = ptr + 0;
	stack[t1] = ptr_n;
	ptr_n = ptr_n + 1;
	ptr = ptr + 7;
	algo_algo();
	ptr = ptr - 7;
	int t2 = ptr + 7;
	int t3 = stack[t2];
	int t4 = ptr + 1;
	stack[t4] = t3;
	int t5 = ptr + 2;
	stack[t5] = ptr_n;
	ptr_n = ptr_n + 1;
	int t6 = ptr + 3;
	stack[t6] = ptr_n;
	ptr_n = ptr_n + 1;
	int t7 = ptr + 4;
	stack[t7] = ptr_n;
	ptr_n = ptr_n + 1;
	stack_n[ptr_n] = 0;
	int t8 = ptr + 5;
	stack[t8] = ptr_n;
	ptr_n = ptr_n + 1;
	int t9 = ptr + 6;
	stack[t9] = ptr_n;
	ptr_n = ptr_n + 1;
	system("clear");
	int t10 = ptr + 9;
	int t11 = ptr + 1;
	int t12 = stack[t11];
	stack[t10] = t12;
	ptr = ptr + 9;
	algo_int_holaMundo();
	ptr = ptr - 9;
	int t13 = ptr + 9;
	int t14 = t13 + 1;
	int t15 = stack[t14];
	int t16 = stack_n[t15];
	ptr = ptr + 9;
	getch();
	ptr = ptr - 9;
	int t17 = ptr + 9;
	int t18 = t17 + 0;
	int t19 = stack[t18];
	char t20 = stack_c[t19];
	printf("Bienvenido");
	ptr = ptr + 9;
	__py__Saludo__();
	ptr = ptr - 9;
	printf("Ingrese el primer valor entero");
	int t21;
	scanf("%d", &t21);
	int t22 = ptr + 2;
	int t23 = stack[t22];
	stack_n[t23] = t21;
	printf("Ingrese el segudo valor entero");
	int t24;
	scanf("%d", &t24);
	int t25 = ptr + 3;
	int t26 = stack[t25];
	stack_n[t26] = t24;
	int t27 = ptr + 9;
	int t28 = ptr + 1;
	int t29 = stack[t28];
	stack[t27] = t29;
	int t31 = ptr + 2;
	int t32 = stack[t31];
	int t33 = stack_n[t32];
	int t34 = ptr + 3;
	int t35 = stack[t34];
	int t36 = stack_n[t35];
	int t37 = t33 + t36;
	int t30 = t27 + 1;
	stack_n[ptr_n] = t37;
	stack[t30] = ptr_n;
	ptr_n = ptr_n + 1;
	ptr = ptr + 9;
	algo_int_factorial_int();
	ptr = ptr - 9;
	int t38 = ptr + 9;
	int t39 = t38 + 4;
	int t40 = stack[t39];
	int t41 = stack_n[t40];
	int t42 = ptr + 5;
	int t43 = stack[t42];
	stack_n[t43] = t41;
	int t44 = ptr + 2;
	int t45 = stack[t44];
	int t46 = stack_n[t45];
	int t47 = ptr + 3;
	int t48 = stack[t47];
	int t49 = stack_n[t48];
	int t50 = t46 + t49;
	int t51 = ptr + 6;
	int t52 = stack[t51];
	stack_n[t52] = t50;
	int t53 = ptr + 6;
	int t54 = stack[t53];
	int t55 = stack_n[t54];
	printf("El factorial de %d", t55);
	int t56 = ptr + 5;
	int t57 = stack[t56];
	int t58 = stack_n[t57];
	printf(" es %d", t58);
	printf("Conversion de años a meses");
	int t59 = ptr + 7;
	stack[t59] = ptr_n;
	ptr_n = ptr_n + 1;
	stack_n[ptr_n] = 0;
	int t60 = ptr + 8;
	stack[t60] = ptr_n;
	ptr_n = ptr_n + 1;
	printf("Ingrese el primer valor entero");
	int t61;
	scanf("%d", &t61);
	int t62 = ptr + 7;
	int t63 = stack[t62];
	stack_n[t63] = t61;
	int t64 = ptr + 9;
	int t65 = ptr + 1;
	int t66 = stack[t65];
	stack[t64] = t66;
	int t68 = ptr + 7;
	int t69 = stack[t68];
	int t70 = stack_n[t69];
	int t67 = t64 + 1;
	stack_n[ptr_n] = t70;
	stack[t67] = ptr_n;
	ptr_n = ptr_n + 1;
	int t72 = ptr + 8;
	int t73 = stack[t72];
	int t74 = stack_n[t73];
	int t71 = t64 + 2;
	stack_n[ptr_n] = t74;
	stack[t71] = ptr_n;
	ptr_n = ptr_n + 1;
	ptr = ptr + 9;
	algo_void_edadmeses_int_int();
	ptr = ptr - 9;
	ptr = ptr + 9;
	getch();
	ptr = ptr - 9;
	int t75 = ptr + 9;
	int t76 = t75 + 0;
	int t77 = stack[t76];
	char t78 = stack_c[t77];
	int t79 = ptr + 5;
	int t80 = stack[t79];
	stack_n[t80] = 1;
	int t81 = ptr + 4;
	int t82 = stack[t81];
	stack_n[t82] = 0;

	L1:
	int t83 = ptr + 4;
	int t84 = stack[t83];
	int t85 = stack_n[t84];
	int t86 = ptr + 3;
	int t87 = stack[t86];
	int t88 = stack_n[t87];
	if(t85 < t88) goto L2;
	goto L3;

	L2:
	int t89 = ptr + 5;
	int t90 = stack[t89];
	int t91 = stack_n[t90];
	int t92 = ptr + 2;
	int t93 = stack[t92];
	int t94 = stack_n[t93];
	int t95 = t91 * t94;
	int t96 = ptr + 5;
	int t97 = stack[t96];
	stack_n[t97] = t95;

	L4:
	int t98 = ptr + 4;
	int t99 = stack[t98];
	int t100 = stack_n[t99];
	int t101 = t100 + 1;
	int t102 = ptr + 4;
	int t103 = stack[t102];
	stack_n[t103] = t101;
	goto L1;

	L3:
	int t104 = ptr + 2;
	int t105 = stack[t104];
	int t106 = stack_n[t105];
	printf("%d", t106);
	printf(" ");
	int t107 = ptr + 3;
	int t108 = stack[t107];
	int t109 = stack_n[t108];
	printf("^ %d", t109);
	int t110 = ptr + 5;
	int t111 = stack[t110];
	int t112 = stack_n[t111];
	printf(" = %d", t112);
	ptr = ptr + 9;
	getch();
	ptr = ptr - 9;
	int t113 = ptr + 9;
	int t114 = t113 + 0;
	int t115 = stack[t114];
	char t116 = stack_c[t115];

	return 0;
}

void __py__Saludo__() {
	printf("%s", "Segundo Proyecto de Compiladores 2");
	printf("\n");
}

void algo_algo() {
	int t1 = ptr + 0;
	stack[t1] = h;
	h = h + 0;
}

void algo_int_holaMundo() {
	int t2 = ptr + 1;
	printf("%s", "Hola Mundo!!");
	printf("\n");
	stack_n[ptr_n] = 1;
	stack[t2] = ptr_n;
	ptr_n = ptr_n + 1;
	goto L1;

	L1:
}

void algo_void_edadmeses_int_int() {
	int t3 = ptr + 1;
	int t4 = stack[t3];
	int t5 = stack_n[t4];
	int t6 = t5 * 12;
	int t7 = ptr + 2;
	int t8 = stack[t7];
	stack_n[t8] = t6;
	printf("%s", "Meses = ");
	printf("%c", 32);
	int t9 = ptr + 2;
	int t10 = stack[t9];
	int t11 = stack_n[t10];
	printf("%d", t11);
	printf("\n");
}

void algo_int_factorial_int() {
	int t12 = ptr + 4;
	stack_n[ptr_n] = 0;
	int t13 = ptr + 2;
	stack[t13] = ptr_n;
	ptr_n = ptr_n + 1;
	stack_n[ptr_n] = 0;
	int t14 = ptr + 3;
	stack[t14] = ptr_n;
	ptr_n = ptr_n + 1;
	int t15 = ptr + 1;
	int t16 = stack[t15];
	int t17 = stack_n[t16];
	int t18 = ptr + 3;
	int t19 = stack[t18];
	stack_n[t19] = t17;
	int t20 = ptr + 1;
	int t21 = stack[t20];
	int t22 = stack_n[t21];
	if(t22 == 0) goto L3;
	goto L4;

	L3:
	stack_n[ptr_n] = 1;
	stack[t12] = ptr_n;
	ptr_n = ptr_n + 1;
	goto L8;
	goto L2;

	L4:
	int t23 = ptr + 2;
	int t24 = stack[t23];
	stack_n[t24] = 1;

	L5:
	int t25 = ptr + 1;
	int t26 = stack[t25];
	int t27 = stack_n[t26];
	if(t27 > 1) goto L6;
	goto L7;

	L6:
	int t28 = ptr + 2;
	int t29 = stack[t28];
	int t30 = stack_n[t29];
	int t31 = ptr + 1;
	int t32 = stack[t31];
	int t33 = stack_n[t32];
	int t34 = t30 * t33;
	int t35 = ptr + 2;
	int t36 = stack[t35];
	stack_n[t36] = t34;
	int t37 = ptr + 1;
	int t38 = stack[t37];
	int t39 = stack_n[t38];
	int t40 = t39 - 1;
	int t41 = ptr + 1;
	int t42 = stack[t41];
	stack_n[t42] = t40;
	goto L5;

	L7:
	int t43 = ptr + 2;
	int t44 = stack[t43];
	int t45 = stack_n[t44];
	stack_n[ptr_n] = t45;
	stack[t12] = ptr_n;
	ptr_n = ptr_n + 1;
	goto L8;
	goto L2;

	L2:

	L8:
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
