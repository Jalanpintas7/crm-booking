import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      fallback: 'index.html',
      strict: false
    }),
    prerender: {
      handleHttpError: ({ path, referrer, message }) => {
        // Ignore missing files during prerender
        if (message.includes('Not found')) {
          return;
        }
        throw new Error(message);
      }
    }
  }
};

export default config;
