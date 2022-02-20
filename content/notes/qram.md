---
title: "qRAM"
date: 2022-02-20T13:52:46+01:00
draft: true
mathjax: true
---

A concept of a quantum random access memory was [first proposed in 2007](https://arxiv.org/pdf/0708.1879.pdf). It offers a a way to randomly address $N=2^n$ data cells with $n$ bits.

## Basic Idea

The basic idea of qRAM is to use address qubits to point to some data in a data qubit register. Encoding of the information in the data register can be done by using controlled gates on the data register (if the information is consisting of only 0's and 1's CNOT gates are used). The address qubit register acts now as the controlling qubits.

The address qubit can be brought into a superposition of all addresses.

$$ \sum_j \frac{1}{\sqrt{N}} |j\rangle_a |0\rangle_d \xrightarrow{\text{qRAM}} \sum_j \frac{1}{\sqrt{N}} |j\rangle_a |D_j\rangle_d$$

## Super Simple Example

Consider now two very simple data points we want to encode and be able to address using one address qubit. Let's store the two numbers 2 and 3 in our data register.

First, we must convert the two numbers into binary representation:

- $2 \rightarrow 10$
- $3 \rightarrow 11$

The number of data points now governs the number of address qubits needed. In our case we want to store two numbers, so the length of our data array `data = [2, 3]` is 2.

Let us first go through it in formulas. Taking the formular above and inputting our data, we get:

$$  \sum_j \frac{1}{\sqrt{N}} |n\rangle_a |0\rangle_d = \sum_{j \in \{ 0, 1 \}} \frac{1}{\sqrt{2}} |j\rangle_a|00\rangle_d = \frac{|0\rangle_a + |1\rangle_a}{\sqrt{2}} |00\rangle_d$$

Encoding our information in qRAM now yields:

$$ \frac{|0\rangle_a + |1\rangle_a}{\sqrt{2}} |00\rangle_d \xrightarrow{\text{qRAM}} \frac{1}{\sqrt{2}} (|0\rangle_a |10\rangle_d + |1\rangle_a |11\rangle_d) = \sum_j \frac{1}{\sqrt{N}} |j\rangle_a |D_j\rangle_d$$

We now see that whenever we measure the address qubit in state $|0\rangle$, the data register will be in a state representing the data point 10 in binary or the number 2 in decimal. Whenever the address qubit is measured in state $|1\rangle$, we know that our data must encode the number 3 for us.

So, how would we crate a quantum circuit for that? Let's break it down to its consituent parts.

```python
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

# create all necessary registers
a = QuantumRegister(1, "address")
d = QuantumRegister(2, "data")
qc = QuantumCircuit(a, d)

# address 0 encoding the number 2 for us (binary 10)
# 0 --> 10
qc.x(a) # address 0 should be used, therefore we need to use the NOT in order to have an effect when using the CNOT gate
qc.cx(a, d[0]) # whenever address qubit is in state 0, the NOT will flip it to 1 and this will trigger the CNOT to encode 10 for us (data0 = 1, data1 = 0)
qc.x(a) # we just need to flip it back where it was before
qc.barrier()

# address 1 encoding the number 3 for us (binary 11)
# 1 --> 11
qc.cx(a, d[0])
qc.cx(a, d[1])

qc.draw(output="mpl")
```

TODO: Add output of Qiskit!

We now successfully encoded our data points and addressed them via the one address qubit. The next step is pretty easy, because we just have to create a uniform superposition of the address qubits. This can be easily done via a Hadamard gate.

```python
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

# create all necessary registers
a = QuantumRegister(1, "address")
d = QuantumRegister(2, "data")
qc = QuantumCircuit(a, d)

# bringin a into a superposition of (|0> + |1>)/sqrt(2)
qc.h(a)
qc.barrier()

# address 0 encoding the number 2 for us (binary 10)
# 0 --> 10
qc.x(a) # address 0 should be used, therefore we need to use the NOT in order to have an effect when using the CNOT gate
qc.cx(a, d[0]) # whenever address qubit is in state 0, the NOT will flip it to 1 and this will trigger the CNOT to encode 10 for us (data0 = 1, data1 = 0)
qc.x(a) # we just need to flip it back where it was before
qc.barrier()

# address 1 encoding the number 3 for us (binary 11)
# 1 --> 11
qc.cx(a, d[0])
qc.cx(a, d[1])

qc.draw(output="mpl")
```

We've now successfully created our first qRAM example. This example is a super simple one, but one can for example take it further by creating an encoding function that takes an data array as an input and returns a quantum circuit.
