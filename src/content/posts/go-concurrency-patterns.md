---
title: "Go 并发模式实践"
date: "2026-06-10"
description: "常用的 Go 并发模式和实现技巧"
tags: ["Go", "Concurrency", "Programming"]
---

# Go 并发模式实践

Go 的并发模型基于 CSP(Communicating Sequential Processes),通过 goroutine 和 channel 实现优雅的并发编程。

## Worker Pool

限制并发数量的经典模式:

```go
func workerPool(jobs <-chan Job, results chan<- Result, numWorkers int) {
    var wg sync.WaitGroup
    
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for job := range jobs {
                results <- processJob(job)
            }
        }()
    }
    
    wg.Wait()
    close(results)
}
```

## Context 传递

使用 context 控制 goroutine 生命周期:

```go
func worker(ctx context.Context) error {
    for {
        select {
        case <-ctx.Done():
            return ctx.Err()
        default:
            // 执行工作
        }
    }
}
```

## Fan-out/Fan-in

分发任务并聚合结果:

```go
func fanOut(input <-chan int, n int) []<-chan int {
    channels := make([]<-chan int, n)
    for i := 0; i < n; i++ {
        ch := make(chan int)
        channels[i] = ch
        go func() {
            for v := range input {
                ch <- process(v)
            }
            close(ch)
        }()
    }
    return channels
}

func fanIn(channels ...<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup
    
    for _, ch := range channels {
        wg.Add(1)
        go func(c <-chan int) {
            defer wg.Done()
            for v := range c {
                out <- v
            }
        }(ch)
    }
    
    go func() {
        wg.Wait()
        close(out)
    }()
    
    return out
}
```

## Pipeline

链式处理数据流:

```go
func pipeline() {
    gen := func(nums ...int) <-chan int {
        out := make(chan int)
        go func() {
            for _, n := range nums {
                out <- n
            }
            close(out)
        }()
        return out
    }
    
    square := func(in <-chan int) <-chan int {
        out := make(chan int)
        go func() {
            for n := range in {
                out <- n * n
            }
            close(out)
        }()
        return out
    }
    
    for n := range square(gen(1, 2, 3, 4)) {
        fmt.Println(n)
    }
}
```

## 注意事项

1. **避免 goroutine 泄漏** - 确保 goroutine 能够退出
2. **正确关闭 channel** - 发送方关闭,接收方检查
3. **使用 sync 包** - Mutex、WaitGroup、Once 等工具

并发编程需要仔细设计,合理使用这些模式可以写出高效且可维护的并发代码。
