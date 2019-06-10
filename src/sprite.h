// Copyright (c) Matthias Rustler. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.

#ifndef SPRITE_H
#define SPRITE_H

#include <stdbool.h>
#include "backend.h"

struct Sprite
{
    struct BackendImage *image;

    float pos_x;
    float pos_y;
    float offset_x;
    float offset_y;
    float dir;
    float speed;
    bool disabled; // not drawn, no collision check

    float speed_x;
    float speed_y;
};

struct Sprite *sprite_new(struct BackendImage *image);
void sprite_destroy(struct Sprite *sprite);
void sprite_reset(struct Sprite *sprite);

void sprite_draw(struct Sprite *sprite);
void sprite_set_position(struct Sprite *sprite, float pos_x, float pos_y);
void sprite_set_image(struct Sprite *sprite, struct BackendImage *image);
void sprite_set_offset(struct Sprite *sprite, float offset_x, float offset_y);
void sprite_set_dir(struct Sprite *sprite, float dir);
void sprite_set_speed(struct Sprite *sprite, float speed);
void sprite_update(struct Sprite *sprite);
void sprite_set_status(struct Sprite *sprite, bool enabled);

#endif
