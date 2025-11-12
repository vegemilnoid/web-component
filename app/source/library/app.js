const APP_GLOBAL_CONFIG = {
  ID: 'wc',
  NAME: 'web-component',
  VERSION: '1.0.0',
  DOMAIN: {
    LOCAL: 'localhost',
    DEVELOPMENT: '',
    PRODUCTION: ''
  },
  URL: {},
  RESOLUTION: {
    MOBILE_VERTICAL: 375,
    MOBILE_HORIZONTAL: 540,
    TABLET_VERTICAL: 820,
    TABLET_HORIZONTAL: 1180,
    DESKTOP: 1920
  },
  ENV: {
    MOBILE: false,
    PRODUCTION: false
  },
  STORAGE: {},
  FUNCTION: {},
};
const APP_GLOBAL_VARIABLE = {
  ENV: {
    MOBILE: false,
    PRODUCTION: false
  }
};
const APP_GLOBAL_FUNCTION = {
  NAME: APP_GLOBAL_CONFIG.ID
};

const loadScript = async (path, type) => {
  return new Promise((resolve, reject) => {
    const $script = document.createElement('script');

    $script.type = 'text/javascript';
    $script.src = path;
    $script.async = false;
    $script.defer = true;
    $script.onload = () => {
      resolve();
    };
    $script.onerror = () => {
      reject('Failed to load script resource.');
    };

    document.querySelector('head').appendChild($script);
  });
};
const loadStyle = async path => {
  return new Promise((resolve, reject) => {
    const $link = document.createElement('link');

    $link.rel = 'stylesheet';
    $link.href = path;
    $link.onload = () => {
      resolve();
    };
    $link.onerror = () => {
      reject('Failed to load style resource.');
    };

    document.querySelector('head').appendChild($link);
  });
};

const { origin } = document.location;

(async () => {
  const path = {
    script: {
      local: `https://${APP_GLOBAL_CONFIG.DOMAIN.LOCAL}/script`,
      development: `https://${APP_GLOBAL_CONFIG.DOMAIN.DEVELOPMENT}/script`,
      production: `https://${APP_GLOBAL_CONFIG.DOMAIN.PRODUCTION}/script`
    },
    style: {
      local: `https://${APP_GLOBAL_CONFIG.DOMAIN.LOCAL}/style`,
      development: `https://${APP_GLOBAL_CONFIG.DOMAIN.DEVELOPMENT}/style`,
      production: `https://${APP_GLOBAL_CONFIG.DOMAIN.PRODUCTION}/style`
    }
  };

  const environment = (() => {
    switch(location.host) {
      case APP_GLOBAL_CONFIG.DOMAIN.LOCAL:
        return 'local';
      case APP_GLOBAL_CONFIG.DOMAIN.DEVELOPMENT:
        return 'development';
      case APP_GLOBAL_CONFIG.DOMAIN.PRODUCTION:
        return 'production';
      default:
        return '';
    }
  })();

  await Promise.all([
    loadScript(`${origin}/script/underscore-1.13.7.min.js`),
    loadScript(`${origin}/script/platform-1.3.5.js`),
    loadScript(`${origin}/script/devicedetector-1.0.2.min.js`),
    loadScript(`${origin}/script/${APP_GLOBAL_CONFIG.NAME}-${APP_GLOBAL_CONFIG.VERSION}${environment === 'production' ? '.min' : ''}.js`)
  ]);

  await Promise.all([
    loadStyle(`${origin}/style/${APP_GLOBAL_CONFIG.NAME}-${APP_GLOBAL_CONFIG.VERSION}.min.css`)
  ]);

  APP_GLOBAL_VARIABLE.ENV.PRODUCTION = ['production'].includes(environment);
  APP_GLOBAL_VARIABLE.ENV.MOBILE = (parsed => {
    if(parsed.type === 'mobile' && ['Mac', 'Linux'].includes(parsed.os)) {
      return navigator.maxTouchPoints > 0;
    }
    else {
      return ['Mobile', 'Tablet'].includes(parsed.type);
    }
  })(DeviceDetector.parse(platform.ua));
})();
