const devConfig = {
    SERVER_URL: 'http://localhost:5000',
}

const prodConfig = {
    SERVER_URL: window.location.protocol + '//' + window.location.host,
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const config = import.meta.env.MODE === 'development' ? devConfig : prodConfig

export default config
