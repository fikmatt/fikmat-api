# FIKMAT API

Simple API that allows your game to control the components of the Fikmat machine.  

## How to use

Send POST request to `http://localhost:8020/api`, request content must be in **JSON** form. Detailed description of parameters below.  
For now API accepts up to **30 requests per second**, more precisely 1 request per 1/30 of a second

```
# complete request example with curl
curl -d "{ \"led_left\": [[255,0,0], [0,255,0], [0,0,255]],
           \"led_right\": [[255,0,0], [0,255,0], [0,0,255]] }" \
     -H "Content-Type: application/json" \
     -X POST http://localhost:8020/api
```

## LED strips

Fikmat has two addressable RGB LED strips which can be controlled with parameters `led_right` and `led_left`.  
Value should be array of colors. Color can be a string with a hex color code or an array with 3 RGB values (0-255).  
Number of colors in array can vary, values are remapped to correct count of diodes on the strip.  
For example, an array with one value will change the color of the entire strip, an array with two colors will change half of the strip to the first color and the other half to the second color.  

```
# changes the entire left strip to white
{ led_left: [[255,255,255]] }
# or with hex code
{ led_left: ['#ffffff'] }

# changes 1/2 to red and 1/2 to green
{ led_left: [[255,0,0], [0,255,0]] }

# changes 1/4 to red, 1/4 to green, 1/4 to blue and 1/4 to white
{ led_left: [[255,0,0], [0,255,0], [0,0,255], [255,255,255]] }

# turns off the left strip
{ led_left: [[0,0,0]] }

# empty array is ignored
{ led_left: [] }
```

## Wrappers for common game engines

- Godot ➜ https://github.com/fikmatt/fikmat-api-wrapper-godot
- Unity ➜ https://github.com/fikmatt/fikmat-api-wrapper-unity
