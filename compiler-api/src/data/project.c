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
	int t1 = ptr + 0;
	stack[t1] = ptr_n;
	int t2 = ptr + 1;
	stack[t2] = 10;
	int t3 = ptr + 1;
	int t4 = stack[t3];
	ptr_n = ptr_n + t4;
	if(1024 >= 1) goto L1;
	goto L2;

	L1:
	int t5 = ptr + 0;
	int t6 = stack[t5];
	int t7 = t6 + 9;
	stack_n[t7] = 1;
	goto L3;

	L2:
	int t8 = ptr + 0;
	int t9 = stack[t8];
	int t10 = t9 + 9;
	stack_n[t10] = 0;

	L3:
	printf("%d\n", stack_n[9]);
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
