var storage = require('node-persist');
storage.initSync();
var crypto = require('crypto-js');


var argv = require('yargs')
  .command('create','Yeni bir hesap oluşturur',function (yargs) {
    yargs.options({
      name : {
        demand : true,
        description : 'Hesap adı (Twitter,Facebook)',
        alias : 'n',
        type : 'string'
      },
      username : {
        demand : true,
        description : 'Username/Kullanıcı Adı',
        alias : 'u',
        type : 'string'
      },
      password : {
        demand : true,
        description : 'Password/Şifre.',
        alias : 'p',
        type : 'string'
      },
      masterPassword : {
        demand : true,
        description : 'İşlem yapabilmek için gerekli olan şifre.',
        alias : 'm',
        type : 'string'
      }
    }).help('help');
  }).command('get','Hesap bilgilerini görüntülemeyi sağlar..',function (yargs) {
    yargs.options({
      name : {
        demand : true,
        description : 'Hesap adı (Twitter,Facebook)',
        alias : 'n',
        type : 'string'
      },
      masterPassword : {
        demand : true,
        description : 'İşlem yapabilmek için gerekli olan şifre',
        alias : 'm',
        type : 'string'
      }
    }).help('help');
  }).help('help')
  .argv;


function saveAccounts(accounts,masterPassword) {
  var encryptedAccount = crypto.AES.encrypt(JSON.stringify(accounts),masterPassword);
  storage.setItemSync("accounts",encryptedAccount.toString());

  return accounts;
}

function getAccounts(masterPassword) {
  var encryptedAccounts = storage.getItemSync("accounts");
  var accounts = [];

  if (typeof encryptedAccounts !== 'undefined'){
    var bytes =  crypto.AES.decrypt(encryptedAccounts,masterPassword);
    accounts = JSON.parse(bytes.toString(crypto.enc.Utf8));
  }
  return accounts;
}

function createAccount(account,masterPassword) {
  var accounts = getAccounts(masterPassword);
  accounts.push(account);
  saveAccounts(accounts,masterPassword);
  return account;
}

function getAccount(accountName,masterPassword) {
  var accounts = getAccounts(masterPassword);
  var matchedAccount;
  accounts.forEach(function (account) {
    if (account.name === accountName){
      matchedAccount = account;
    }
  });
  return matchedAccount;
}



var command = argv._[0];
if(command === 'create' && typeof argv.name !== 'undefined' && argv.name.length > 0 && typeof argv.username !== 'undefined' && argv.username.length > 0 && typeof argv.password !== 'undefined' && argv.password.length > 0 && typeof argv.masterPassword !== 'undefined' && argv.masterPassword.length > 0){

  var createdAccount = createAccount({
    name : argv.name,
    username : argv.username,
    password : argv.password
  },argv.masterPassword);

  console.log("Hesap Olusturuldu..");
}else if (command === 'get' && typeof argv.name !== 'undefined' && argv.name.length > 0 && typeof argv.masterPassword !== 'undefined' && argv.masterPassword.length > 0){
  var account = getAccount(argv.name,argv.masterPassword);
  if (typeof  account !== 'undefined'){
    console.log(account);
  }else{
    console.log("Aradığınız Kayıt Bulunamamıştır...!");
  }
}else{
  console.log("Lütfen Geçerli Bir Komut Giriniz...!");
}


