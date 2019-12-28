var DIRECTION = {
    any: "any",
    up: "up",
    down: "down",
    left: "left",
    right: "right",
    upperLeft: "upperLeft",
    upperRight: "upperRight",
    lowerLeft: "lowerLeft",
    lowerRight: "lowerRight",
    external: "external",
}

var DIMENSION = {
    any: [
        {
            range: [0, 360],
            value: DIRECTION.any
        }
    ],
    four: [
        {
            range: [45, 135],
            value: DIRECTION.up
        },
        {
            range: [135, 225],
            value: DIRECTION.left
        },
        {
            range: [225, 315],
            value: DIRECTION.down
        },
        {
            range: [315, 360],
            value: DIRECTION.right
        },
        {
            range: [0, 45],
            value: DIRECTION.right
        },
    ],
    v: [
        {
            range: [0, 180],
            value: DIRECTION.up
        },
        {
            range: [180, 360],
            value: DIRECTION.down
        }
    ],
    h: [
        {
            range: [90, 270],
            value: DIRECTION.left
        },
        {
            range: [270, 360],
            value: DIRECTION.right
        },
        {
            range: [0, 90],
            value: DIRECTION.right
        }
    ],
    r: [
        {
            range: [45, 225],
            value: DIRECTION.upperLeft
        },
        {
            range: [225, 360],
            value: DIRECTION.lowerRight,

        },
        {
            range: [0, 45],
            value: DIRECTION.upperLeft
        }
    ],
    l: [
        {
            range: [135, 275],
            value: DIRECTION.lowerLeft
        },
        {
            range: [275, 360],
            value: DIRECTION.upperRight
        },
        {
            range: [0, 135],
            value: DIRECTION.upperRight
        }
    ],
    diagonal: [
        {
            range: [0, 90],
            value: DIRECTION.upperRight
        },
        {
            range: [90, 180],
            value: DIRECTION.upperLeft
        },
        {
            range: [180, 270],
            value: DIRECTION.lowerLeft
        },
        {
            range: [270, 360],
            value: DIRECTION.lowerRight
        }
    ],
    all: [
        {
            range: [22.5, 22.5 * 3],
            value: DIRECTION.lowerRight
        },
        {
            range: [22.5 * 3, 22.5 * 5],
            value: DIRECTION.DIR_UP
        },
        {
            range: [22.5 * 5, 22.5 * 7],
            value: DIRECTION.upperLeft
        },
        {
            range: [22.5 * 7, 22.5 * 9],
            value: DIRECTION.left
        },
        {
            range: [22.5 * 9, 22.5 * 11],
            value: DIRECTION.lowerLeft
        },
        {
            range: [22.5 * 11, 22.5 * 13],
            value: DIRECTION.down
        },
        {
            range: [22.5 * 13, 22.5 * 15],
            value: DIRECTION.lowerRight
        },
        {
            range: [22.5 * 15, 360],
            value: DIRECTION.right
        },
        {
            range: [0, 22.5],
            value: DIRECTION.right
        }
    ]
}
