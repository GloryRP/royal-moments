import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createClient } from '@supabase/supabase-js';

// Local dev middleware for /api/create-upload-url to emulate Vercel Serverless Function locally
function devApiPlugin() {
  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/create-upload-url', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Method not allowed' }));
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const { fileName, mimeType, fileSize, passcode } = data;

            // Load env
            const env = loadEnv('', process.cwd(), '');
            const requiredPasscode = env.UPLOAD_ACCESS_SECRET;
            if (requiredPasscode && passcode !== requiredPasscode) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Invalid or missing upload authorization passcode' }));
            }

            if (!fileName) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'File name is required' }));
            }

            const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
            const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseUrl || !serviceRoleKey) {
              // Dev demo fallback indicator if credentials are not configured
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ 
                error: 'Supabase credentials not configured in environment. Please check your .env file.',
                missingEnv: true 
              }));
            }

            const supabase = createClient(supabaseUrl, serviceRoleKey);
            const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
            const sanitizedBase = fileName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
            const uniquePath = `photos/${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${sanitizedBase}.${ext}`;

            // Create signed upload URL
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('media')
              .createSignedUploadUrl(uniquePath);

            if (uploadError) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: uploadError.message }));
            }

            const { data: publicUrlData } = supabase.storage
              .from('media')
              .getPublicUrl(uniquePath);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
              signedUrl: uploadData.signedUrl,
              token: uploadData.token,
              path: uploadData.path,
              publicUrl: publicUrlData.publicUrl
            }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
          }
        });
      });

      // Local dev middleware for /api/delete-media
      server.middlewares.use('/api/delete-media', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Method not allowed' }));
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const { id, filePath, passcode } = data;

            const env = loadEnv('', process.cwd(), '');
            const requiredPasscode = env.ADMIN_DELETE_PASSCODE || 'nov22';
            if (!passcode || passcode.trim().toLowerCase() !== requiredPasscode.toLowerCase()) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Invalid passcode. Only authorized organizers can delete memories.' }));
            }

            const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
            const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseUrl || !serviceRoleKey) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: true, id }));
            }

            if (String(id).startsWith('local_')) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: true, id }));
            }

            const supabase = createClient(supabaseUrl, serviceRoleKey);
            if (filePath && !filePath.startsWith('blob:')) {
              let storagePath = filePath;
              if (filePath.includes('/storage/v1/object/public/media/')) {
                storagePath = filePath.split('/storage/v1/object/public/media/')[1];
              }
              try {
                await supabase.storage.from('media').remove([storagePath]);
              } catch (e) {}
            }

            const { error: dbError } = await supabase.from('media').delete().eq('id', id);
            if (dbError) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: dbError.message }));
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, id }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: err.message || 'Internal error' }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), devApiPlugin()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          framer: ['framer-motion'],
          jszip: ['jszip'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: false
  }
});
