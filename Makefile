CC = gcc
EXE = ohmyballs

SRCS = src/main.c src/game.c src/sprite.c

SRCS += src/backend_sdl1.c

OBJS = $(patsubst %.c, %.o, $(SRCS))

CFLAGS = -Wall -MP -MD -g
LDFLAGS = -lSDL -lSDL_image -lm -g

$(EXE) : $(OBJS)
	$(CC) -o $@ $^ $(LDFLAGS)

clean:
	rm -f $(EXE) src/*.o src/*.d

-include $(SRCS:%.c=%.d)
