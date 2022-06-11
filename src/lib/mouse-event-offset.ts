var rootPosition = { left: 0, top: 0 }

export default mouseEventOffset
function mouseEventOffset (ev:any, target:EventTarget, out: number[]) {
  target = target || ev.currentTarget || ev.srcElement
  if (!Array.isArray(out)) {
    out = [ 0, 0 ]
  }
  var cx = ev.clientX || 0
  var cy = ev.clientY || 0
  var rect = getBoundingClientOffset(target)
  out[0] = cx - rect.left
  out[1] = cy - rect.top
  return out
}

function getBoundingClientOffset (element:EventTarget) {
  if (element === window ||
      element === document ||
      element === document.body) {
    return rootPosition
  } else {
    return (element as Element).getBoundingClientRect()
  }
}