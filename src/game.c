// Copyright (c) Matthias Rustler. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.

#include <math.h>
#include <stdio.h>

#include <SDL/SDL.h>

#include "game.h"
#include "sprite.h"

#define NR_OF_BALLS 7
#define MAX_NR_OF_SKULLS 10
#define MAX_NR_OF_KEYS 10
#define SCREEN_WIDTH 640
#define SCREEN_HEIGHT 512

#define COLL_NONE 0
#define COLL_BORDER 1
#define COLL_BALL 2
#define COLL_SKULL 3
#define COLL_KEY 4

struct Game
{
    struct BackendImage *ball_img;
    struct BackendImage *ball_hl_img;
    struct BackendImage *key_img;
    struct BackendImage *skull_img;

    struct Sprite *ball[NR_OF_BALLS];
    struct Sprite *skull[MAX_NR_OF_SKULLS];
    struct Sprite *key[MAX_NR_OF_KEYS];

    int current_ball;
    int number_of_skulls;
    int number_of_keys;
    int number_of_keys_collected;
};

static struct Game game;

static float distance2(float dx, float dy)
{
    return pow(dx, 2) + pow(dy, 2);
}

static int find_nearest_ball(struct Sprite *ball[], int mouse_x, int mouse_y)
{
    int i;
    float dist2 = 1000000;
    float cur_dist2;
    int retval = -1;

    for (i = 0; i < NR_OF_BALLS; i++)
    {
        cur_dist2 = distance2(ball[i]->pos_x - mouse_x, ball[i]->pos_y - mouse_y);
        if (cur_dist2 < dist2)
        {
            dist2 = cur_dist2;
            retval = i;
        }
    }
    printf("nearest %d\n", retval);
    return retval;
}

static int collision_check(int *coll1, int *coll2)
{
    int i, j;
    float dist2;

    *coll1 = -1;
    *coll2 = -1;

    // collision with border
    for (i = 0; i < NR_OF_BALLS; i++)
    {
        if (game.ball[i]->pos_x < 16)
        {
            *coll1 = i;
            *coll2 = 0;
            return COLL_BORDER;
        }
        if (game.ball[i]->pos_x > SCREEN_WIDTH - 16)
        {
            *coll1 = i;
            *coll2 = 1;
            return COLL_BORDER;
        }
        if (game.ball[i]->pos_y < 16)
        {
            *coll1 = i;
            *coll2 = 2;
            return COLL_BORDER;
        }
        if (game.ball[i]->pos_y > SCREEN_HEIGHT - 16)
        {
            *coll1 = i;
            *coll2 = 3;
            return COLL_BORDER;
        }
    }

    // collision with other ball
    for (i = 0; i < NR_OF_BALLS - 1; i++)
    {
        for (j = i + 1; j < NR_OF_BALLS; j++)
        {
            dist2 = distance2(game.ball[i]->pos_x - game.ball[j]->pos_x, game.ball[i]->pos_y - game.ball[j]->pos_y);
            if (dist2 < 800)
            {
                *coll1 = i;
                *coll2 = j;
                return COLL_BALL;
            }
        }
    }

    // collision with skull
    for (i = 0; i < NR_OF_BALLS; i++)
    {
        for (j = 0; j < game.number_of_skulls; j++)
        {
            dist2 = distance2(game.ball[i]->pos_x - game.skull[j]->pos_x, game.ball[i]->pos_y - game.skull[j]->pos_y);
            if (dist2 < 800)
            {
                *coll1 = i;
                *coll2 = j;
                return COLL_SKULL;
            }
        }
    }

    // collision with key
    for (i = 0; i < NR_OF_BALLS; i++)
    {
        for (j = 0; j < game.number_of_keys; j++)
        {
            if (!game.key[j]->disabled)
            {
                dist2 = distance2(game.ball[i]->pos_x - game.key[j]->pos_x, game.ball[i]->pos_y - game.key[j]->pos_y);
                if (dist2 < 800)
                {
                    *coll1 = i;
                    *coll2 = j;
                    return COLL_KEY;
                }
            }
        }
    }

    return COLL_NONE;
}

static bool game_handle_events(void)
{
    SDL_Event event;

    while (SDL_PollEvent(&event))
    {
        switch(event.type)
        {
            case SDL_KEYDOWN:  /* Handle a KEYDOWN event */
                printf("Oh! Key press\n");
                return false;
                break;
            case SDL_MOUSEBUTTONDOWN:
                printf("Mousedown x %d y %d\n", event.button.x, event.button.y);
                game.current_ball = find_nearest_ball(game.ball, event.button.x, event.button.y);
                if (game.current_ball != -1)
                {
                    sprite_set_image(game.ball[game.current_ball], game.ball_hl_img);
                }
                break;

            case SDL_MOUSEBUTTONUP:
                puts("Mouseup");
                if (game.current_ball != -1)
                {
                    float dir = atan2(event.button.y - game.ball[game.current_ball]->pos_y,
                                      event.button.x - game.ball[game.current_ball]->pos_x);
                    printf("dir %f\n", dir);
                    sprite_set_image(game.ball[game.current_ball], game.ball_img);
                    sprite_set_dir(game.ball[game.current_ball], dir);
                }
                break;
            default:
                //printf("I don't know what this event is!\n");
                break;
        }
    }
    return true;
}

static void game_draw(void)
{
    int i;

    backend_set_background_color(0, 0, 255);
    for (i = 0; i < NR_OF_BALLS; i++)
    {
        sprite_draw(game.ball[i]);
    }

    for (i = 0; i < game.number_of_skulls; i++)
    {
        sprite_draw(game.skull[i]);
    }

    for (i = 0; i < game.number_of_keys; i++)
    {
        if (!game.key[i]->disabled)
        {
            sprite_draw(game.key[i]);
        }
    }

    backend_flip();
}

static void game_update(void)
{
    int i;

    int coll1;
    int coll2;

    int coll = collision_check(&coll1, &coll2);
    switch (coll)
    {
        case COLL_BORDER:
        case COLL_SKULL:
        case COLL_BALL:
            puts("bumm");
            for (i = 0; i < NR_OF_BALLS; i++)
            {
                sprite_set_speed(game.ball[i], 0);
            }
            break;
        case COLL_KEY:
            sprite_set_status(game.key[coll2], false);
            game.number_of_keys_collected++;
            printf("keys %d\n", game.number_of_keys_collected);
            break;
    }

    for (i = 0; i < NR_OF_BALLS; i++)
    {
        sprite_update(game.ball[i]);
    }
}

static void game_loop(void)
{
    bool running = true;

    game.current_ball = -1;
    while (running)
    {
        running = game_handle_events();
        game_update();
        game_draw();
    }
}

void game_init(void)
{
    int i;

    backend_init(SCREEN_WIDTH, SCREEN_HEIGHT);
    game.ball_img = backend_image_load("data/gfx/ball.png");
    game.ball_hl_img = backend_image_load("data/gfx/ball_hl.png");
    game.key_img = backend_image_load("data/gfx/key.png");
    game.skull_img = backend_image_load("data/gfx/skull.png");

    for (i = 0; i < NR_OF_BALLS; i++)
    {
        game.ball[i] = sprite_new(game.ball_img);
        sprite_set_position(game.ball[i], i * 80 + 50, SCREEN_HEIGHT - 50);
        sprite_set_offset(game.ball[i], 16, 16);
        sprite_set_dir(game.ball[i], 270.0 * M_PI / 180.0);
        sprite_set_speed(game.ball[i], 0.05);
    }

    for (i = 0; i < 1; i++)
    {
        game.skull[i] = sprite_new(game.skull_img);
        sprite_set_offset(game.skull[i], 16, 16);
    }
    sprite_set_position(game.skull[0], 100, 180);
    //sprite_set_position(game.skull[1], 200, 150);
    //sprite_set_position(game.skull[2], 150, 170);
    //sprite_set_position(game.skull[3], 300, 150);
    //sprite_set_position(game.skull[4], 500, 150);
    game.number_of_skulls = 1;

    for (i = 0; i < 3; i++)
    {
        game.key[i] = sprite_new(game.key_img);
        sprite_set_offset(game.key[i], 16, 16);
    }
    sprite_set_position(game.key[0], 120, 80);
    sprite_set_position(game.key[1], 250, 50);
    sprite_set_position(game.key[2], 450, 70);
    game.number_of_keys = 3;

}

void game_run(void)
{
    game_loop();
}

void game_destroy(void)
{
    int i;

    for (i = 0; i < NR_OF_BALLS; i++)
    {
        sprite_destroy(game.ball[i]);
    }
    backend_image_destroy(game.ball_img);
    backend_image_destroy(game.ball_hl_img);
    backend_image_destroy(game.key_img);
    backend_image_destroy(game.skull_img);
    backend_destroy();
}
