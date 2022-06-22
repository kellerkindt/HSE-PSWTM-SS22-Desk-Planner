import * as React from "react";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import BottomNavBar from "./BottomNavBar";
import Dropdowns from "./Dropdowns";
import { fabric } from "fabric";
import HttpService from "../services/HttpService";


var points_handler = {
    x: [],
    y: [],
}

var table_handler = {
    x: [],
    y: [],
}

function addDesk(canvas, left, top) {
    var d = new fabric.Rect({
        left: left,
        top: top,
        fill: 'brown',
        width: 20,
        height: 20
    });

    d.hasControls = d.hasBorders = false;

    canvas.add(d);
    canvas.renderAll();
    //canvas.render();
}

function fillPointHandles(id, x, y) {
    points_handler.x[id - 1] = x;
    points_handler.y[id - 1] = y;
}

function saveCanvas(canvas) {
    console.log(canvas.toJSON());
}

class LayoutDesigner extends React.Component {

    componentDidMount() {
        var canvas = (this.__canvas = new fabric.Canvas("c", {
            selection: false,
            height: window.innerHeight,
            width: window.innerWidth * 0.8,
            borders: "2px solid black",
            backgroundColor: "white",
            fireRightClick: true,
            stopContextMenu: true,
        }));
        fabric.Object.prototype.originX = fabric.Object.prototype.originY =
            "center";

        function makeCircle(left, top , id, line1, line2, line3, line4) {
            var c = new fabric.Circle({
                id: id,
                type: "wallPoint",
                left: left,
                top: top,
                strokeWidth: 5,
                radius: 12,
                fill: "#fff",
                stroke: "#666",
            });
            c.hasControls = c.hasBorders = false;

            c.line1 = line1;
            c.line2 = line2;
            c.line3 = line3;
            c.line4 = line4;

            return c;
        }

        function makeLine(coords) {
            return new fabric.Line(coords, {
                fill: "red",
                stroke: "red",
                strokeWidth: 5,
                selectable: false,
                evented: true,
            });
        }

        var start_x = 200;      //adjust where to start the basic wallshape on the x axis
        var start_y = 150;      //adjust where to start the basic wallshape on the y axis
        var point_gap = 150;    //adjust the distance between the points on the wallshape
        var lines = [];         //array to store the lines

        //top horizontal line
        for(var i = 0; i < 5; i++) {
            lines [i] = makeLine([start_x + (i * point_gap), start_y, start_x + ((i + 1) * point_gap) , start_y]);
        }
        //right vertical line
        for(var i = 5; i < 10; i++) {
            lines[i] = makeLine([start_x + (5 * point_gap), start_y + ((i - 5) * point_gap), start_x + (5 * point_gap), start_y + ((i - 4) * point_gap)]);
        }
        //bottom horizontal line
        for(var i = 10; i < 15; i++) {
            lines[i] = makeLine([start_x + ((5 - (i - 10)) * point_gap), start_y + (5 * point_gap), start_x + ((5 - (i - 9)) * point_gap), start_y + (5 * point_gap)]);
        }
        //left vertical line
        for(var i = 15; i < 20; i++) {
            lines[i] = makeLine([start_x, start_y + ((5 - (i - 15)) * point_gap), start_x, start_y + ((5 - (i - 14)) * point_gap)]);
        }

        for(var i = 0; i < lines.length; i++) {
            canvas.add(lines[i]);
        }

        for(var i = 0; i < lines.length; i++) {
            if(i != 19) {
                canvas.add(makeCircle(lines[i].get("x2"), lines[i].get("y2"), i + 1, lines[i], lines[i + 1]));
            } else {
                canvas.add(makeCircle(lines[i].get("x2"), lines[i].get("y2"), i + 1, lines[i], lines[0]));
            }
            points_handler.x[i] = lines[i].get("x2");
            points_handler.y[i] = lines[i].get("y2");
        }


        let grid = 50;

        // Grid display part
        for (var i = 0; i < 1200 / grid; i++) {
            canvas.add(
                new fabric.Line([i * grid, 0, i * grid, 1200], {
                    stroke: "#ccc",
                    selectable: false,
                })
            );
            canvas.add(
                new fabric.Line([0, i * grid, 1200, i * grid], {
                    stroke: "#ccc",
                    selectable: false,
                })
            );
        }

        canvas.on("object:moving", function (e) {
            var p = e.target;

            //console.log(e.target.id);

            //console.log("object:moving");

            if (
                Math.round((e.target.left / grid) * 4) % 4 === 0 &&
                Math.round((e.target.top / grid) * 4) % 4 === 0
            ) {
                e.target
                    .set({
                        left: Math.round(e.target.left / grid) * grid,
                        top: Math.round(e.target.top / grid) * grid,
                    })
                    .setCoords();
            }
            p.line1 && p.line1.set({ x2: p.left, y2: p.top });
            p.line2 && p.line2.set({ x1: p.left, y1: p.top });
            p.line3 && p.line3.set({ x2: p.left, y2: p.top });
            p.line4 && p.line4.set({ x1: p.left, y1: p.top });

            if(e.target.type === "wallPoint") {
                fillPointHandles(e.target.id, p.left, p.top);
            } else if (e.target.type === "rect") {
                //TODO: write fillRectHandles function
            }
        });


        //TODO: Toggle on "Tisch" Button
        //TODO: implement handle for tables
        canvas.on('mouse:down', function(options) {
            
            if (!options.target)
               return;

            if (options.button === 3 && options.target.type === 'rect') {
                canvas.remove(canvas.getActiveObject());
                return;
            }

        });

        canvas.on('mouse:dblclick', function(options) {
            if (options.target)
               return;
        
            var rect = new fabric.Rect({
                left: options.e.clientX - 700,
                top: options.e.clientY - 100,
                width: 100,
                height: 60,
                fill: 'rgba(107, 62, 19)',
                snapAngle: 45,
            });
            canvas.add(rect);
        });



    }
    render() {
        return (
            <Container
                sx={{ marginTop: "64px", marginBottom: "64px", padding: "12px" }}
            >
                <Dropdowns/>
                <div class="layoutButtonDiv">
                    <Button
                        variant="contained"
                        sx={{ border: "2px solid black" }}
                        onClick={() => { addDesk(this.__canvas, 300, 300); }}
                    >
                        Tisch
                    </Button>

                    <Button
                        variant="contained"
                        sx={{ border: "2px solid black" }}
                    >
                        Wand
                    </Button>

                    <Button
                        variant="contained"
                        sx={{ border: "2px solid black" }}
                    >
                        Tür
                    </Button>

                    <Button
                        variant="contained"
                        sx={{ border: "2px solid black", float: "right" }}
                        onClick={() => {
                            HttpService.postRoom(1, 1, 1, "Konferenz 1", 10, "", points_handler);
                        }}
                    >
                        Speichern
                    </Button>
                </div>



                {/* Hier sind die Buttons zum Einfügen von Elementen*/}

                <canvas id="c" />

                {/* Hier ist der Button zum Speichern*/}
                <BottomNavBar />
            </Container>
        );
    }
}

export default LayoutDesigner;
