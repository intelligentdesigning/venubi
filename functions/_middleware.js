// Send www.venubi.de to the main domain so the site lives under one address
export async function onRequest({ request, next }) {
    const url = new URL(request.url);
    if (url.hostname === 'www.venubi.de') {
        url.hostname = 'venubi.de';
        return Response.redirect(url.toString(), 301);
    }
    return next();
}
