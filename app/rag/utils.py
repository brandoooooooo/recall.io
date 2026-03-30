from queue import Queue
from typing import Generic, Type, TypeVar

T = TypeVar("T")


class Pool(Generic[T]):
    def __init__(self, model: Type[T], construct_kwargs: dict, size: int = 5):
        """Initializes a pool of objects of type T.

        Args:
            size: The number of instances in the pool.
            model: A callable that returns an instance of T.
            construct_kwargs: Keyword arguments passed to the constructor of T.
        """
        self.pool = Queue(maxsize=size)
        for _ in range(size):
            self.pool.put(model(**construct_kwargs))

    def acquire(self) -> T:
        return self.pool.get()

    def release(self, instance: T) -> None:
        self.pool.put(instance)
