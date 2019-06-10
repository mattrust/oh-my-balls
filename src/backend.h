// Copyright (c) Matthias Rustler. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.

#ifndef BACKEND_H
#define BACKEND_H

#include <stdbool.h>

struct BackendImage
{
    void *imageptr; // e.g. SDL_Surface
};

bool backend_init(int screen_width, int screen_height);
void backend_destroy(void);

struct BackendImage *backend_image_load(const char *path);
void backend_image_destroy(struct BackendImage *image);
void backend_image_draw(struct BackendImage *image, int xpos, int ypos);
void backend_set_background_color(int red, int green, int blue);
void backend_flip(void);

#endif
