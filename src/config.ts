const devConfig = {
    SERVER_URL: 'http://localhost:5000',
    STORAGE: sessionStorage,
}

const prodConfig = {
    SERVER_URL: window.location.protocol + '//' + window.location.host,
    STORAGE: localStorage,
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const config = import.meta.env.MODE === 'development' ? devConfig : prodConfig

export default config
