
/**
 * Upload `file` with the following options:
 *
 * - `key` object key
 * - `acl` visibility [default: public-read]
 * - `policy` s3 policy base64 encoded
 * - `signature` s3 computed signature
 * - `credential` s3 access key
 * - `algorithm` s3 signature algoritm used [default: AWS4-HMAC-SHA256]
 * - `date` s3 date
 * - `action` s3 end-point
 * - `onprogress` progress callback
 * - `type` content-type [default: file.type]
 */

module.exports = function upload(file, options) {
  var form = new FormData
  var xhr = new XMLHttpRequest

  form.append('key', options.key)
  form.append('acl', options.acl || 'public-read')
  form.append('Policy', options.policy)
  form.append('Content-Type', options.type || file.type || 'application/octet-stream')
  form.append('X-Amz-Credential', options.credential)
  form.append('X-Amz-Algorithm', options.algorithm || 'AWS4-HMAC-SHA256')
  form.append('X-Amz-Signature', options.signature)
  form.append('X-Amz-Date', options.date)
  form.append('file', file)

  return new Promise(function(resolve, reject){
    if (options.onprogress) {
      xhr.upload.addEventListener('progress', function(e){
        e.percent = e.loaded / e.total * 100
        options.onprogress(e)
      }, false)
    }

    xhr.onreadystatechange = function(){
      if (4 != xhr.readyState) return
      if (xhr.status < 400) return resolve({ url: options.action + options.key })
      var err = new Error(xhr.responseText)
      err.status = xhr.status
      err.statusText = xhr.statusText
      reject(err)
    }

    xhr.open('POST', options.action, true)
    xhr.send(form)
  })
}

