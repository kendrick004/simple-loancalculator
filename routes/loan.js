const express = require('express');
const router = express.Router();

//import library
const ajax = require('../lib/ajax');

let url = 'https://api.au.apiconnect.ibmcloud.com/questronix-corporation-dev/sb/loans/v1';

//create /redirect endpoint
router.get('/', function(req, res, next) {
  res.render('about', {
    page: 'about'
  });
});

router.get('/auto', function(req, res, next) {
  res.render('loan', {
    page: 'auto'
  });
});

router.get('/house', function(req, res, next) {
  res.render('loan', {
    page: 'house'
  });
});

router.get('/auto/all', (req, res, next)=>{
  let uri = `${url}/all`;
  ajax.setOptions({
    uri: uri
  })
  ajax.get().then(data=>{
    res.send(data.body);
  }).catch(error=>{
    res.json(error);
  })
});

router.get('/auto/brand/:brand_id', (req, res, next)=>{
  let uri = `${url}/brand/${req.params.brand_id}`;
  ajax.setOptions({
    uri: uri
  })
  ajax.get().then(data=>{
    res.send(data.body);
  }).catch(error=>{
    res.json(error);
  })
});

router.get('/auto/brand/:brand_id/model/:model_id', (req, res, next)=>{
  let uri = `${url}/brand/${req.params.brand_id}/model/${req.params.model_id}`;
  ajax.setOptions({
    uri: uri
  })
  ajax.get().then(data=>{
    res.send(data.body);
  }).catch(error=>{
    res.json(error);
  })
});

module.exports = router;