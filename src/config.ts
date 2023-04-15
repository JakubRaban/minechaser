const devConfig = {
  SERVER_URL: 'http://localhost:5000'
};

const prodConfig = {
  SERVER_URL: window.location.protocol + '//' + window.location.host
}

const config = devConfig;

export default config;