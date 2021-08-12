**Battery Queue:** An IndexedDB-backed browser job queue for asynchronous tasks. Suitable for use with service workers.

[![Battery Queue](./badge.svg)](https://github.com/bunchtogether/battery) [![CircleCI](https://circleci.com/gh/bunchtogether/battery.svg?style=shield)](https://circleci.com/gh/bunchtogether/battery) [![npm version](https://badge.fury.io/js/%40bunchtogether%2Fbattery.svg)](http://badge.fury.io/js/%40bunchtogether%2Fbattery) [![codecov](https://codecov.io/gh/bunchtogether/battery/branch/master/graph/badge.svg)](https://codecov.io/gh/bunchtogether/battery)

# Basic Usage

```js
import BatteryQueue from '@bunchtogether/battery';
import { enqueueToDatabase } from '@bunchtogether/battery/database';

const queue = new BatteryQueue();

queue.setHandler('mybasicjob', (args) => {
  const [name] = args;
  console.log(`Job ${name} was executed`);
});

const run = async () => {
  const queueId = 'mybasicqueue'; // Jobs with the same queue ID run serially
  const type = 'mybasicjob'; // Use the "mybasicjob" handler for this job
  const args = ["X"]; // Array of arguments to be passed to the handler
  const delayInMs = 100; // Delay the start of the task by 100ms

  await enqueueToDatabase(queueId, type, args, delayInMs);
  await queue.dequeue();
}
```

# Advanced Usage

## Create the queue

BatteryQueues can be used in browser or worker contexts and share a 'battery-queue' IndexedDB database. Typically you would only create a single queue instance.

In `./queue.js`:

```js
import BatteryQueue from '@bunchtogether/battery';

// The queue object interfaces with the database
export const queue = new BatteryQueue();

```

## Add job handlers

Job type handlers receive an arbitrary array of arguments, an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal), and a function used to store data that might be used for job cleanup in the event of an error.

The arguments should be serializable with the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm).

In `./myjob-handler.js`:

```js
import { queue } from './queue';
import { AbortError } from '@bunchtogether/battery/errors';

queue.setHandler('myjob', async (args, abortSignal, updateCleanupData) => {
  const [name, blob] = args;
  await new Promise((resolve) => setTimeout(resolve, 100));
  // Monitor the abort signal to handle external aborts gracefully, 
  // i.e. queue.abortQueue(queueId)
  if(abortSignal.aborted) { 
    throw new AbortError(`MyJob "${name}" was aborted before the upload`);
  }
  // Generates a random string and uploads the blob
  const uploadId = Math.round(Math.random() * Number.MAX_SAFE_INTEGER).toString('16');
  const putResponse = await fetch(`https://my.example.com/uploads/${uploadId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': blob.type 
    },
    body: blob
  });
  // Adds the uploadId string to the cleanup data in the database in case
  // the job errors in subsequent jobs or is aborted
  await updateCleanupData({
    uploadId
  });
  const { myUploadResultParameter } = await putResponse.json();
  if(abortSignal.aborted) { 
    throw new AbortError(`MyJob "${name}" was aborted before the POST to the API`);
  }
  // Takes a result from the upload and POSTS to an API
  const postResponse = await fetch(`https://my.example.com/api/do-something-with-upload`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ myUploadResultParameter });
  });
  const { myApiResultParameter } = await postResponse.json();
  // Adds the myApiResultParameter string to the cleanup data
  await updateCleanupData({
    myApiResultParameter
  });
  console.log(`Completed MyJob "${name}"`);
});

````

## Add job cleanups

Job cleanups are run following an error or if the queue is aborted during or after execution. The function is called with any cleanup data the handler added, the original handler arguments, and a function to remove paths from the cleanup data object as the cleanup takes place.

In `./myjob-cleanup-handler.js`:

```js
import { queue } from './queue';

queue.setCleanup('myjob', (cleanupData, args, removePathFromCleanupData) => {
  const [name] = args;
  const { myApiResultParameter } = cleanupData;
  if(typeof myApiResultParameter === 'string') {
    await fetch(`https://my.example.com/api/something-with-upload/${myApiResultParameter}`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: '{}'
    });
    // Remove "myApiResultParameter" path from cleanup data so that this portion of the cleanup
    // is not run twice
    await removePathFromCleanupData(['myApiResultParameter']);
  }
  const { uploadId } = cleanupData;
  if(typeof uploadId === 'string') {
    await fetch(`https://my.example.com/uploads/${uploadId}`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: '{}'
    });
    await removePathFromCleanupData(['uploadId']);
  }
  console.log(`Cleaned up MyJob "${name}"`);
});

```

## Enqueue jobs

Jobs are enqueued directly to the IndexedDB database. This allows jobs to be added in a browser context, and executed in a worker context.

In `./enqueue-jobs-to-database.js`:

```js
import { enqueueToDatabase } from '@bunchtogether/battery/database';

export const queueId = 'myqueue'; // Jobs with the same queue ID run serially

export const enqueueJobs = async () => {

  const type = 'myjob'; // Use the "myjob" handlers for this job
  
  const delayInMs = 0; // Delay the start of the task by 0ms

  // Job handler arguments are serialized using the native structured clone algorithm.
  const nameA = "A";
  const blobA = new Blob([0,0,0], {type: 'my/mimetype'});
  const nameB = "B";
  const blobB = new Blob([1,1,1], {type: 'my/mimetype'});

  // Add tasks to the IndexedDB database. 
  const idA = await enqueueToDatabase(queueId, type, [nameA, blobA], delayInMs);
  const idB = await enqueueToDatabase(queueId, type, [nameB, blobB], delayInMs);

  console.log(`Enqueued jobs "${nameA}" (${idA}) and "${nameB}" ${idB}`);
}
```

## Dequeue, execute, and abort (if necessary)

Jobs sharing the same queue ID are executed serially, and jobs with different queue IDs will be executed in parallel. 

A queue can be aborted during or after execution. Any job handlers that completed successfully will be cleaned up.

In `./my-queue-app.js`:

```js
import { queue } from './queue';
import './myjob-handler';
import './myjob-cleanup-handler';
import { queueId, enqueueJobs } from './enqueue-jobs-to-database.js';

const executeJobs = async () => {
  
  await enqueueJobs();

  await queue.dequeue(); // Dequeues tasks from the database and executes the tasks
  await queue.onIdle(); // Wait for task execution to complete

  // ... later, if necessary ...

  // Run cleanup handlers for all completed tasks in the queue.
  // Cleanups handlers run in reverse order.
  await queue.abortQueue(queueId); 
}

executeJobs();
```
As the jobs are enqueued using the `enqueueJobs()` method we defined earlier, logs:
```
Enqueued jobs "A" (45) and "B" (46)
```
Assuming successful execution, logs:
```
Completed MyJob "A" 
Completed MyJob "B" 
```
After `queue.abortQueue(queueId)`, logs:
```
Cleaned up MyJob "B" 
Cleaned up MyJob "A" 
```

## See also

* [**Hustle**](https://github.com/orthecreedence/hustle): A persistent javascript queuing/messaging library
* [**tq**](https://github.com/bryanmikaelian/tq): Queue backed by Indexeddb. Inspired by Resque. tq === "the queue"

