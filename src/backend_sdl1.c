// Copyright (c) Matthias Rustler. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.

#include <SDL/SDL.h>
#include <SDL/SDL_image.h>
#include <stdbool.h>

#include "backend.h"

static SDL_Surface *screen;

bool backend_init(int screen_width, int screen_height)
{
    if (SDL_Init(SDL_INIT_VIDEO | SDL_INIT_TIMER) == -1)
    {
        printf("SDL_Init failed: %s\n", SDL_GetError());
        return false;
    }

    screen = SDL_SetVideoMode(screen_width, screen_height, 0, SDL_ANYFORMAT | SDL_DOUBLEBUF | SDL_HWSURFACE);
    if (screen == NULL)
    {
        printf("SDL_SetVideoMode failed: %s\n", SDL_GetError());
        return false;
    }

    return true;
}

void backend_destroy(void)
{
    SDL_Quit();
}

struct BackendImage *backend_image_load(const char *path)
{
    SDL_Surface *image = NULL;
    SDL_Surface *newimage = NULL;
    struct BackendImage *return_image = NULL;

    image = IMG_Load(path);
    if (image == NULL)
    {
        printf("IMG_Load failed for file '%s': %s\n", path, SDL_GetError());
        goto bailout;
    }

    SDL_SetColorKey(image, SDL_SRCCOLORKEY, SDL_MapRGB(image->format, 255, 0, 255));

    newimage = SDL_DisplayFormat(image);
    if (newimage)
    {
        SDL_FreeSurface(image);
        image = newimage;
    }
    else
    {
        printf("SDL_DisplayFormat failed for file '%s': %s\n", path, SDL_GetError());
        goto bailout;
    }

    return_image = malloc(sizeof (struct BackendImage));
    if (return_image)
    {
        return_image->imageptr = image;
    }
    else
    {
        goto bailout;
    }

    return return_image;

bailout:
    SDL_FreeSurface(image);
    free(return_image);
    return NULL;
}

void backend_image_destroy(struct BackendImage *image)
{
    if (image)
    {
        SDL_FreeSurface(image->imageptr);
        free(image);
    }
}

void backend_image_draw(struct BackendImage *image, int xpos, int ypos)
{
    SDL_Rect rect = {xpos, ypos, 0, 0};
    SDL_BlitSurface(image->imageptr, NULL, screen, &rect);
}

void backend_set_background_color(int red, int green, int blue)
{
    SDL_FillRect(screen, NULL, SDL_MapRGB(screen->format, red, green, blue));
}

void backend_flip(void)
{
    SDL_Flip(screen);
}
