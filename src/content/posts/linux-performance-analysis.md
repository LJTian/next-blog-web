---
title: "Linux 性能分析工具链"
date: "2026-07-22"
description: "系统性介绍 Linux 性能分析的工具和方法论"
tags: ["Linux", "Performance", "Observability"]
---

# Linux 性能分析工具链

性能问题排查是系统工程师的核心技能。本文介绍常用的 Linux 性能分析工具和方法。

## 性能观测的层次

性能分析应该自顶向下进行:

1. **应用层** - 应用指标和日志
2. **系统层** - CPU、内存、磁盘、网络
3. **内核层** - 系统调用、中断、调度

## 核心工具

### top 和 htop

实时查看系统资源使用:

```bash
top -H -p <pid>  # 显示线程
htop            # 更友好的界面
```

### perf

强大的性能分析工具:

```bash
# CPU 采样分析
perf record -F 99 -p <pid> -g -- sleep 30
perf report

# 查看系统调用
perf trace -p <pid>
```

### iostat 和 iotop

磁盘 I/O 分析:

```bash
iostat -x 1    # 扩展统计,每秒更新
iotop -o       # 只显示有 I/O 的进程
```

## eBPF 工具

现代 Linux 性能分析离不开 eBPF:

```bash
# 跟踪慢速系统调用
bpftrace -e 'tracepoint:syscalls:sys_enter_* { @start[tid] = nsecs; }
              tracepoint:syscalls:sys_exit_* /@start[tid]/ {
                $dur = nsecs - @start[tid];
                if ($dur > 1000000) { @slow[probe] = count(); }
              }'
```

## 方法论

1. **建立基线** - 了解正常状态的指标
2. **USE 方法** - Utilization, Saturation, Errors
3. **关联分析** - 跨层次关联问题

性能优化是持续过程,需要系统性的方法和工具支持。
