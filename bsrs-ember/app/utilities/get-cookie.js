// See https://docs.djangoproject.com/en/dev/ref/csrf/#ajax
export default function getCookie(name, cookie = document.cookie) {
  let value = null;
  if (cookie && cookie !== '') {
    let cookies = cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        value = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return value;
}
