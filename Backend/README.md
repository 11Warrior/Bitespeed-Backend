# Bitespeed-Backend


## Approach Flow
1. find contacts where email OR phone matches
2. get all linkedIds
3. fetch entire contact group
4. find oldest primary
5. decide:
   - create secondary
   - merge primaries
6. return aggregated data

## What to do ? 
=> Create new contact -> when no entry in db is present
=> Create new secondary contact -> when one primary contact is present
=> Update the second primary contact -> When multiple primary contacts can be linked with given request

## In example we have two primaries and merged the contacts in this case, What if there are more than 2 primaries ?

=> Oldest contact is primary, rest of them should be secondary

## What if the request exactly matches in case of one primary contact ?

=> we dont have to create new contact 


