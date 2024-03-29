const ESP = require('../models/ESP');
const { createNewESP, getDevicesStatus } = require('../../util/esp');
const { generateObjectID } = require('../../util/mongoose');
const { json } = require('express');
const { consoleLog } = require('@ngrok/ngrok');

class ESPController {


    // [GET] /Object_1s/get
    // get(req, res, next) {
    //     res.json(req.body);
    // }

    // [GET] /esp/connect/:id?numDevices=
    connect(req, res, next) {
        ESP.findOne({ _idESP: req.params.id })
            .then((esp) => {
                if (esp) {
                    console.log('existed in db');
                    return Promise.resolve(esp);
                } else {
                    const jsonNewESP = createNewESP(req.params.id, req.query.numDevices);
                    const espNew = ESP(jsonNewESP);
                    espNew.save();
                    return Promise.resolve(espNew);
                }
            }).then((savedEsp) => {
                res.json(savedEsp)
            })
            .catch(next);
    }


    // [POST] /:idESP
    async post(req, res, next) {
        const devicesNewStatus = req.body.devices;
        try {
            await Promise.all(devicesNewStatus.map(async (device) => {
                const foundDevice = await ESP.findOne({
                    _idESP: req.params.idESP,
                    devices: {
                        $elemMatch: {
                            _id: device.id
                        }
                    }
                });
                if (!foundDevice) {
                    throw new Error(`Not found ESP with _idESP = ${req.params.idESP} or device with ${device.id}`);
                }

                await ESP.updateOne({
                    _idESP: req.params.idESP,
                    devices: {
                        $elemMatch: {
                            _id: device.id
                        }
                    }
                }, {
                    $set: {
                        'devices.$.status': (String('on').valueOf() == new String(device.status).valueOf()) ? 1 : 0,
                    }
                });
            }));

            res.status(201).json({
                'text': 'Successful'
            });
        } catch (error) {
            console.error(error);
            res.status(406).json({
                'text': 'Failure'
            });
        }
    }

    // [POST] /:idESP
    async get(req, res, next) {
        ESP.findOne({ _idESP: req.params.idESP })
            .then((esp) => {
                if (esp) {
                    console.log('existed in db');
                    return Promise.resolve(esp);
                } else {
                    throw new Error(`Not found esp with _idESP = ${req.params.idESP}`)
                }
            }).then((savedEsp) => {
                var resJson = ESP(savedEsp);
                resJson.devices = getDevicesStatus(savedEsp);

                res.status(200).json({
                    _idESP: resJson._idESP,
                    numDevices: resJson.numDevices,
                    isConnected: resJson.isConnected,
                    devices: resJson.devices,
                    _id: resJson._id
                });
            })
            .catch(err => {
                res.status(404).json({
                    'text': err.message.toString()
                });
            });
    }
}

module.exports = new ESPController; // Tạo một instance cho TestController

//const CourseController = require('./CourseController');