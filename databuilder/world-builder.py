import pandas as pd
import networkx as nx

# Read the CSV file
df = pd.read_csv('examples/object-fields-nod.csv')

# Create a directed graph
G = nx.DiGraph()

# Add nodes and edges
for index, row in df.iterrows():
    G.add_node(row['Type'])
    if pd.notna(row['Relationship']):
        G.add_edge(row['Relationship'], row['Type'])

# Perform topological sort
ordered_types = list(nx.topological_sort(G))

print("Ordered Types:", ordered_types)
