class AprioriAlgorithm {
  constructor(minSupport = 0.01, minConfidence = 0.3, minLift = 1.0) {
    this.minSupport = minSupport;
    this.minConfidence = minConfidence;
    this.minLift = minLift;
  }

  // Generate frequent itemsets
  generateFrequentItemsets(transactions) {
    const itemCount = new Map();
    const transactionCount = transactions.length;

    // Count individual items
    transactions.forEach((transaction) => {
      const items = new Set(transaction.items.map(item => item.productId));
      items.forEach((item) => {
        itemCount.set(item, (itemCount.get(item) || 0) + 1);
      });
    });

    // Filter by minimum support
    const frequentItems = new Map();
    itemCount.forEach((count, item) => {
      const support = count / transactionCount;
      if (support >= this.minSupport) {
        frequentItems.set([item], { count, support });
      }
    });

    return this.expandItemsets(transactions, frequentItems, transactionCount);
  }

  // Expand to larger itemsets
  expandItemsets(transactions, frequentItemsets, transactionCount) {
    let currentItemsets = Array.from(frequentItemsets.keys());
    let allFrequentItemsets = new Map(frequentItemsets);
    let k = 1;

    while (currentItemsets.length > 0 && k < 4) { // Limit to 3-item combinations
      const candidates = this.generateCandidates(currentItemsets);
      const candidateCounts = new Map();

      transactions.forEach((transaction) => {
        const items = transaction.items.map(item => item.productId);
        candidates.forEach((candidate) => {
          if (candidate.every((item) => items.includes(item))) {
            const key = candidate.join(',');
            candidateCounts.set(key, (candidateCounts.get(key) || 0) + 1);
          }
        });
      });

      const newFrequentItemsets = [];
      candidateCounts.forEach((count, key) => {
        const support = count / transactionCount;
        if (support >= this.minSupport) {
          const itemset = key.split(',');
          allFrequentItemsets.set(itemset, { count, support });
          newFrequentItemsets.push(itemset);
        }
      });

      currentItemsets = newFrequentItemsets;
      k++;
    }

    return allFrequentItemsets;
  }

  // Generate candidate itemsets
  generateCandidates(itemsets) {
    const candidates = [];
    for (let i = 0; i < itemsets.length; i++) {
      for (let j = i + 1; j < itemsets.length; j++) {
        const merged = [...new Set([...itemsets[i], ...itemsets[j]])];
        if (merged.length === itemsets[i].length + 1) {
          candidates.push(merged.sort());
        }
      }
    }
    return candidates;
  }

  // Generate association rules
  generateRules(frequentItemsets, transactions) {
    const rules = [];
    const transactionCount = transactions.length;

    frequentItemsets.forEach((value, itemset) => {
      if (itemset.length < 2) return;

      // Generate all non-empty subsets
      const subsets = this.generateSubsets(itemset);
      
      subsets.forEach((antecedent) => {
        const consequent = itemset.filter((item) => !antecedent.includes(item));
        
        if (consequent.length === 0) return;

        const antecedentSupport = this.calculateSupport(antecedent, frequentItemsets);
        const itemsetSupport = value.support;
        const confidence = itemsetSupport / antecedentSupport;

        const consequentSupport = this.calculateSupport(consequent, frequentItemsets);
        const lift = confidence / consequentSupport;

        if (confidence >= this.minConfidence && lift >= this.minLift) {
          rules.push({
            antecedent,
            consequent,
            support: itemsetSupport,
            confidence,
            lift,
          });
        }
      });
    });

    // Sort by lift (descending)
    return rules.sort((a, b) => b.lift - a.lift);
  }

  // Generate subsets
  generateSubsets(itemset) {
    const subsets = [];
    const n = itemset.length;
    
    for (let i = 1; i < (1 << n) - 1; i++) {
      const subset = [];
      for (let j = 0; j < n; j++) {
        if (i & (1 << j)) {
          subset.push(itemset[j]);
        }
      }
      subsets.push(subset);
    }
    
    return subsets;
  }

  // Calculate support for an itemset
  calculateSupport(itemset, frequentItemsets) {
    for (let [key, value] of frequentItemsets) {
      if (JSON.stringify(key.sort()) === JSON.stringify(itemset.sort())) {
        return value.support;
      }
    }
    return 0;
  }

  // Main execution
  execute(transactions) {
    const frequentItemsets = this.generateFrequentItemsets(transactions);
    const rules = this.generateRules(frequentItemsets, transactions);
    return { frequentItemsets: Array.from(frequentItemsets), rules };
  }
}

module.exports = AprioriAlgorithm;
