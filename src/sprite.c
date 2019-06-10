// Copyright (c) Matthias Rustler. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.

#include <stdlib.h>
#include <math.h>

#include "sprite.h"
#include "backend.h"

struct Sprite *sprite_new(struct BackendImage *image)
{
    struct Sprite *sprite;

    sprite = malloc(sizeof (struct Sprite));
    if (sprite)
    {
        sprite_reset(sprite);
        sprite->image = image;
    }
    return sprite;
}

void sprite_destroy(struct Sprite *sprite)
{
    free(sprite);
}

void sprite_reset(struct Sprite *sprite)
{
    if (sprite)
    {
        sprite->pos_x = 0;
        sprite->pos_y = 0;
        sprite->offset_x = 0;
        sprite->offset_y = 0;
        sprite->dir = 0;
        sprite->speed = 0;
        sprite->disabled = false;
        sprite->speed_x = 0;
        sprite->speed_y = 0;
    }
}

void sprite_draw(struct Sprite *sprite)
{
    backend_image_draw(sprite->image,
                       sprite->pos_x - sprite->offset_x,
                       sprite->pos_y - sprite->offset_y);
}

void sprite_set_image(struct Sprite *sprite, struct BackendImage *image)
{
    sprite->image = image;
}

void sprite_set_position(struct Sprite *sprite, float pos_x, float pos_y)
{
    sprite->pos_x = pos_x;
    sprite->pos_y = pos_y;
}

void sprite_set_offset(struct Sprite *sprite, float offset_x, float offset_y)
{
    sprite->offset_x = offset_x;
    sprite->offset_y = offset_y;
}

void sprite_set_dir(struct Sprite *sprite, float dir)
{
    sprite->dir = dir;
}

void sprite_set_speed(struct Sprite *sprite, float speed)
{
    sprite->speed = speed;
}

void sprite_update(struct Sprite *sprite)
{
    sprite->speed_x = sprite->speed * cos(sprite->dir);
    sprite->speed_y = sprite->speed * sin(sprite->dir);

    // printf("speed x %f speed y %f\n", sprite->speed_x, sprite
    sprite->pos_x += sprite->speed_x;
    sprite->pos_y += sprite->speed_y;
}

void sprite_set_status(struct Sprite *sprite, bool enabled)
{
    sprite->disabled = enabled ? false : true;
}
