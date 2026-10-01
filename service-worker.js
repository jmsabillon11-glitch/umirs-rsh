/* =====================================================
   UMIRS - SISTEMA RSH
   SERVICE WORKER OFFLINE
===================================================== */

const CACHE_NAME = "umirs-rsh-v1";

const ARCHIVOS_CACHE = [
  "./",
  "./index.html",
  "./logo_muni.png",
  "./marca ciudad-1.png",
  "./logo_umirs.png.jpg"
];


/* =====================================================
   INSTALACIÓN
===================================================== */

self.addEventListener("install", function(event) {

  event.waitUntil(

    caches
      .open(CACHE_NAME)

      .then(function(cache) {

        console.log(
          "UMIRS RSH: guardando archivos offline"
        );

        return cache.addAll(
          ARCHIVOS_CACHE
        );

      })

  );

  self.skipWaiting();

});


/* =====================================================
   ACTIVACIÓN
===================================================== */

self.addEventListener("activate", function(event) {

  event.waitUntil(

    caches
      .keys()

      .then(function(nombresCache) {

        return Promise.all(

          nombresCache.map(
            function(nombre) {

              if (
                nombre !== CACHE_NAME
              ) {

                return caches.delete(
                  nombre
                );

              }

            }
          )

        );

      })

  );

  self.clients.claim();

});


/* =====================================================
   PETICIONES
===================================================== */

self.addEventListener("fetch", function(event) {

  const request = event.request;


  if (
    request.method !== "GET"
  ) {

    return;

  }


  const url =
    new URL(request.url);


  /*
    NO guardar llamadas a Google Apps Script.

    Los datos de Sheets siempre deben
    consultarse en línea.
  */

  if (
    url.hostname ===
    "script.google.com"
  ) {

    return;

  }


  /*
    Para navegación del portal:

    Internet disponible:
    usa versión actual.

    Sin internet:
    usa index.html almacenado.
  */

  if (
    request.mode === "navigate"
  ) {

    event.respondWith(

      fetch(request)

        .then(function(response) {

          return response;

        })

        .catch(function() {

          return caches.match(
            "./index.html"
          );

        })

    );

    return;

  }


  /*
    Para imágenes y archivos estáticos:
    primero buscar en caché.
  */

  event.respondWith(

    caches.match(request)

      .then(function(responseCache) {

        if (responseCache) {

          return responseCache;

        }


        return fetch(request)

          .then(function(responseRed) {

            return responseRed;

          });

      })

  );

});
