var DIRECTION = {
    // DIR_P: "DIR_P", //PANEL
    // DIR_ANY: "DIR_ANY", //treated as any direction
    // DIR_U: "up",
    // DIR_D: "down",
    // DIR_L: "left",
    // DIR_R: "right",
    // DIR_UP_L: "upperLeft",
    // DIR_UP_R: "upperRight",
    // DIR_LOW_L: "lowerLeft",
    // DIR_LOW_R: "lowerRight",
    // DIR_OUTER: "external",
    DIR_P: "DIR_P", //PANEL
    DIR_ANY: "DIR_ANY", //treated as any direction
    DIR_U: "DIR_U",
    DIR_D: "DIR_D",
    DIR_L: "DIR_L",
    DIR_R: "DIR_R",
    DIR_UP_L: "DIR_UP_L",
    DIR_UP_R: "DIR_UP_R",
    DIR_LOW_L: "DIR_LOW_L",
    DIR_LOW_R: "DIR_LOW_R",
    DIR_OUTER: "DIR_OUTER",
}

var DIMENSION = {

    ALLOW_ONE: [
        {
            range: [0, 361],
            value: DIRECTION.DIR_ANY
        }
    ],
    ALLOW_NORMAL: [
        {
            range: [45, 135],
            value: DIRECTION.DIR_U
        },
        {
            range: [135, 225],
            value: DIRECTION.DIR_L
        },
        {
            range: [225, 315],
            value: DIRECTION.DIR_D
        },
        {
            range: [315, 360],
            value: DIRECTION.DIR_R
        },
        {
            range: [0, 45],
            value: DIRECTION.DIR_R
        },
    ],
    ALLOW_V: [
        {
            range: [0, 180],
            value: DIRECTION.DIR_U
        },
        {
            range: [180, 360],
            value: DIRECTION.DIR_D
        }
    ],
    ALLOW_H: [
        {
            range: [90, 270],
            value: DIRECTION.DIR_L
        },
        {
            range: [270, 360],
            value: DIRECTION.DIR_R
        },
        {
            range: [0, 90],
            value: DIRECTION.DIR_R
        }
    ],
    ALLOW_UP_L_LOW_R: [
        {
            range: [45, 225],
            value: DIRECTION.DIR_UP_L
        },
        {
            range: [225, 360],
            value: DIRECTION.DIR_LOW_R,

        },
        {
            range: [0, 45],
            value: DIRECTION.DIR_UP_L
        }
    ],
    ALLOW_LOW_L_UP_R: [
        {
            range: [135, 275],
            value: DIRECTION.DIR_LOW_L
        },
        {
            range: [275, 360],
            value: DIRECTION.DIR_UP_R
        },
        {
            range: [0, 135],
            value: DIRECTION.DIR_UP_R
        }
    ],
    ALLOW_QUADRANT: [
        {
            range: [0, 90],
            value: DIRECTION.DIR_UP_R
        },
        {
            range: [90, 180],
            value: DIRECTION.DIR_UP_L
        },
        {
            range: [180, 270],
            value: DIRECTION.DIR_LOW_L
        },
        {
            range: [270, 360],
            value: DIRECTION.DIR_LOW_R
        }
    ],
    ALLOW_ALL: [
        {
            range: [22.5, 22.5 * 3],
            value: DIRECTION.DIR_LOW_R
        },
        {
            range: [22.5 * 3, 22.5 * 5],
            value: DIRECTION.DIR_UP
        },
        {
            range: [22.5 * 5, 22.5 * 7],
            value: DIRECTION.DIR_UP_L
        },
        {
            range: [22.5 * 7, 22.5 * 9],
            value: DIRECTION.DIR_L
        },
        {
            range: [22.5 * 9, 22.5 * 11],
            value: DIRECTION.DIR_LOW_L
        },
        {
            range: [22.5 * 11, 22.5 * 13],
            value: DIRECTION.DIR_D
        },
        {
            range: [22.5 * 13, 22.5 * 15],
            value: DIRECTION.DIR_LOW_R
        },
        {
            range: [22.5 * 15, 360],
            value: DIRECTION.DIR_R
        },
        {
            range: [0, 22.5],
            value: DIRECTION.DIR_R
        }
    ]
}
