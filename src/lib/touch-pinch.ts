import { TEventEmitter } from './TEventEmitter';

import eventOffset from './mouse-event-offset';


function distance(a: number[], b: number[]) {
  var x = b[0] - a[0],
      y = b[1] - a[1]
  return Math.sqrt(x*x + y*y)
}

export default touchPinch;

function touchPinch (target: EventTarget) {
  target = target || window

  var emitter = new TEventEmitter();
  //FIX IT. change fingers to some type
  var fingers: any[] = [ null, null ]
  var activeCount = 0

  var lastDistance = 0
  var ended = false
  var enabled = false

  // some read-only values
  Object.defineProperties(emitter, {
    pinching: {
        value: function (): boolean {
            return activeCount === 2
          }
    },
    fingers: {
        value: function() {
            return fingers;
        }
    }
/*    pinching(){
      return activeCount === 2
    },

    fingers() {
      return fingers
    }
*/
  })

  enable()
  emitter.enable = enable
  emitter.disable = disable
  emitter.indexOfTouch = indexOfTouch
  return emitter

  function indexOfTouch (touch) {
    var id = touch.identifier
    //FIX IT. look for "fingers". maybe change it to some object
    for (var i = 0; i < fingers.length; i++) {
      if (fingers[i] &&
        fingers[i]!.touch &&
        fingers[i]!.touch.identifier === id) {
        return i
      }
    }
    return -1
  }

  function enable () {
    if (enabled) return
    enabled = true
    target.addEventListener('touchstart', onTouchStart as EventListener, false)
    target.addEventListener('touchmove', onTouchMove as EventListener, false)
    target.addEventListener('touchend', onTouchRemoved as EventListener, false)
    target.addEventListener('touchcancel', onTouchRemoved as EventListener, false)
  }

  function disable () {
    if (!enabled) return
    enabled = false
    activeCount = 0
    fingers[0] = null
    fingers[1] = null
    lastDistance = 0
    ended = false
    target.removeEventListener('touchstart', onTouchStart as EventListener, false)
    target.removeEventListener('touchmove', onTouchMove as EventListener, false)
    target.removeEventListener('touchend', onTouchRemoved as EventListener, false)
    target.removeEventListener('touchcancel', onTouchRemoved as EventListener, false)
  }

  function onTouchStart (ev: TouchEvent) {
    for (var i = 0; i < ev.changedTouches.length; i++) {
      var newTouch = ev.changedTouches[i]
      var id = newTouch.identifier
      var idx = indexOfTouch(id)

      if (idx === -1 && activeCount < 2) {
        var first = activeCount === 0

        // newest and previous finger (previous may be undefined)
        var newIndex = fingers[0] ? 1 : 0
        var oldIndex = fingers[0] ? 0 : 1
        var newFinger = new Finger()

        // add to stack
        fingers[newIndex] = newFinger
        activeCount++

        // update touch event & position
        newFinger.touch = newTouch
        eventOffset(newTouch, target, newFinger.position)

        var oldTouch = fingers[oldIndex] ? fingers[oldIndex].touch : undefined
        emitter.emit('place', newTouch, oldTouch)

        if (!first) {
          var initialDistance = computeDistance()
          ended = false
          emitter.emit('start', initialDistance)
          lastDistance = initialDistance
        }
      }
    }
  }

  function onTouchMove (ev: TouchEvent) {
    var changed = false
    for (var i = 0; i < ev.changedTouches.length; i++) {
      var movedTouch = ev.changedTouches[i]
      var idx = indexOfTouch(movedTouch)
      if (idx !== -1) {
        changed = true
        fingers[idx].touch = movedTouch // avoid caching touches
        eventOffset(movedTouch, target, fingers[idx].position)
      }
    }

    if (activeCount === 2 && changed) {
      var currentDistance = computeDistance()
      emitter.emit('change', currentDistance, lastDistance)
      lastDistance = currentDistance
    }
  }

  function onTouchRemoved (ev: TouchEvent) {
    for (var i = 0; i < ev.changedTouches.length; i++) {
      var removed = ev.changedTouches[i]
      var idx = indexOfTouch(removed)

      if (idx !== -1) {
        fingers[idx] = null
        activeCount--
        var otherIdx = idx === 0 ? 1 : 0
        var otherTouch = fingers[otherIdx] ? fingers[otherIdx].touch : undefined
        emitter.emit('lift', removed, otherTouch)
      }
    }

    if (!ended && activeCount !== 2) {
      ended = true
      emitter.emit('end')
    }
  }

  function computeDistance () {
    if (activeCount < 2) return 0
    return distance(fingers[0].position, fingers[1].position)
  }
}

function Finger () {
  this.position = [0, 0]
  this.touch = null
}