# Flow

- Consumer instantiates a new Worker
  - Gives it an option to indicate use threads, or child processes
- Create a new pooler
- Consumer calls run with a job
- The job runs through the pooler that will spawn a process
  - Or do we pre spawn processes..
  - child processes are slow to start up.
- If you give me a bunch of tasks maybe you can predetermine the need of more processes.
- Or we can simplify life by just having an option of how many workers do you want to spawn.

We have to pipe the logging back, do we merge streams here?

# Terminology

Farm - Is responsible for orchestrating everything
Pools - Houses the workers
Worker - Runs the jobs


# Functionality

- Create a pool of workers, thread or child process based
- Run jobs/tasks in parallel using the worker pool
- Optionally pre-spawn workers for performance
- Dynamically scale the number of workers based on workload
- Pipe and merge logging/output from all workers
- Expose an API to submit jobs and receive results
- Support graceful shutdown: close all workers when done
- Isolate jobs so state and mocks do not leak between tasks
- Optionally allow configuration of max workers, worker type, and logging behavior
- Track and report job status, errors, and results