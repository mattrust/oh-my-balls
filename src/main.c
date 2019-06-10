// Copyright (c) Matthias Rustler. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.

#include "game.h"

int main(void)
{
    game_init();
    game_run();
    game_destroy();

    return 0;
}
