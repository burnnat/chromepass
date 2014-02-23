ExtJS Chrome Package
=====================

A package to facilitate easy use of ExtJS to build applications targeted for ChromeOS.
For rendering, ExtJS uses some calls to eval() which are restricted by ChromeOS to
being run within a sandboxed frame. This makes interaction with the native ChromeOS
API difficult as the API is not directly available within sandboxed frames. In
addition to supplying overrides to suppress the restricted portions of ExtJS outside
the sandbox, this package also provides utilities for communication between a
sandboxed and non-sandboxed frame to allow usage of the Chrome native API.
