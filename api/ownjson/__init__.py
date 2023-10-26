import jsonpickle


def dumps(value, *args, **kwargs):
    return jsonpickle.encode(value, unpicklable=False, *args, **kwargs)


def loads(value, *args, **kwargs):
    return jsonpickle.decode(value, *args, **kwargs)
