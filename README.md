# FIKMAT API

Simple API that allows your game to control the components of the Fikmat machine.  

## How to use

Send POST request to `http://localhost:8020/api`, request content must be in **JSON** form. Detailed description of parameters below.  
For now API accepts up to **30 requests per second**, more precisely 1 request per 1/30 of a second

```
# complete request example with curl
curl -d "{ \"led_left\": [[255,0,0], [0,255,0], [0,0,255]], 
           \"led_right\": [[255,0,0], [0,255,0], [0,0,255]],
           \"vibrate\": 100 }" \
     -H "Content-Type: application/json" \
     -X POST http://localhost:8020/api
```

## LED strips

Fikmat has two addressable RGB LED strips which can be controlled with parameters `led_right` and `led_left`.  
Value should be array of colors. Color is defined as array with 3 RGB values (0-255).
Number of colors in array can vary, values are remapped to correct count of diodes on the strip.  
For example array with one value will change color of whole strip, array with 2 colors will change half of strip to first color and second half to second color.  

```
# changes whole the left strip to white
{ led_left: [[255,255,255]] }

# changes 1/2 to red and 1/2 to green
{ led_left: [[255,0,0], [0,255,0]] }

# changes 1/4 to red, 1/4 to green, 1/4 to blue and 1/4 to white
{ led_left: [[255,0,0], [0,255,0], [0,0,255], [255,255,255]] }

# turns off the left strip
{ led_left: [[0,0,0]] }

# empty array is ignored
{ led_left: [] }
```
## Vibrations

To switch on vibrations, use parameter `vibrate` with number representing intensity of vibration. Value should be between 0 and 99.
Vibration lasts 150 ms by default. If you need it to last longer, you will have to send the parameter repeatedly.  

```
# vibrates with maximum power
{ vibrate: 99 }

# vibrates with half power
{ vibrate: 49 }

# turns off vibrations
{ vibrate: 0 }
```

## Wrappers for common game engines

- Godot ➜ https://github.com/fikmatt/fikmat-api-wrapper-godot
- Unity ➜ https://github.com/fikmatt/fikmat-api-wrapper-unity
