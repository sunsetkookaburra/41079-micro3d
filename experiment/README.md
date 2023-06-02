+++
+++
# QR3D

This experiment folder is full of work on to way to our implementation.

41079 Computing Science Studio 2

* https://github.com/kenchris/sensor-polyfills
* https://github.com/exif-js/exif-js
* https://github.com/adtile/Full-Tilt
* https://github.com/mattiasw/ExifReader
* https://photo.stackexchange.com/questions/38288/what-is-the-focal-length-on-your-typical-cell-phone-camera
* https://en.wikipedia.org/wiki/Angle_of_view
* https://stackoverflow.com/questions/22142395/how-to-calculate-fov
* Acceleration under 0.05 m/s counts towards stationary/drift calc
* https://stackoverflow.com/questions/3377288/how-to-remove-gravity-factor-from-accelerometer-readings-in-android-3-axis-accel
* https://en.wikiversity.org/wiki/PlanetPhysics/Direction_Cosine_Matrix
* https://rotations.berkeley.edu/reconstructing-the-motion-of-a-tossed-iphone/
* https://stackoverflow.com/questions/6911900/android-remove-gravity-from-accelerometer-readings
* https://stackoverflow.com/questions/9074947/is-there-any-way-to-remove-the-small-bias-along-the-gravity-axis-in-the-accelero

## Algorithms To-Do

- [ ] Bounding Box Centrepoints
- [ ] Local Position Correlation
- [ ] Global Position Rectification

## Correlation

1. Find the most commonly occuring object.
    - Correlate distances by relative bbox y-heights
2. Find the next most commonly occuring object.
    - Correlate position by known Frame points, and distances between them, and bearings to objects.

## Correlation 2

1. Correlate relative distances by relative bbox y-heights on all objects.
2. Average the distances between each.
3. Trig to work out distances to objects based on averaged.
4. Absolute size by correlating GPS
