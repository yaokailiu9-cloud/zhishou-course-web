"""Idempotently create the reviewed 688-yuan product using verified existing fields."""
import json,os,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CLI=os.environ.get('ZION_CLI','/Users/nidie/.codex/plugins/cache/zion/zion-nocode/2.8.0/bin/zion-mcp')
def gql(query,variables=None):
 p=subprocess.run([CLI,'runtime','graphql','--args',json.dumps({'query':query,'variables':variables or {}},ensure_ascii=False)],cwd=os.environ.get('ZION_PROJECT_CWD',str(ROOT)),env={**os.environ,'MCP_LOG_FILE':'off'},capture_output=True,text=True,timeout=120)
 if p.returncode:raise RuntimeError('Product operation failed; inspect local diagnostics')
 d=json.loads(p.stdout);assert not d.get('errors'),d.get('errors');return d.get('data',d)
where={'_eq':{'text_operand':{'left_operand':{'column':'product_kind'},'right_operand':{'literal':'CHILD_EDUCATION_BUNDLE'}}}}
rows=gql('query EducationProduct{public_class(where:{_eq:{text_operand:{left_operand:{column:product_kind},right_operand:{literal:"CHILD_EDUCATION_BUNDLE"}}}},limit:2){id title registration_fee notice}}')['public_class']
ids=list(range(7,15))
if rows:
 assert len(rows)==1 and float(rows[0]['registration_fee'])==688 and json.loads(rows[0]['notice'])=={'version':1,'courseIds':ids},'Existing product differs; review instead of overwriting'
 product=rows[0]
else:
 courses=gql('query EducationSourceCourses{course(limit:200){id subtitle enabled public_video}}')['course']
 assert sorted(int(c['id']) for c in courses if c['enabled'] and c['subtitle']=='《答案库》系列课程' and c['public_video'] is not True)==ids,'Live paid child courses changed; review scope'
 product=gql('mutation CreateEducationProduct($object:public_class_insert_input!){insert_public_class_one(object:$object){id title registration_fee}}',{'object':{'title':'孩子教育课程包','description':'包含孩子教育板块现有8门非公开课程。一次购买，支付到账后绑定付款账号解锁观看；公开课程继续开放。','notice':json.dumps({'version':1,'courseIds':ids},ensure_ascii=False),'product_kind':'CHILD_EDUCATION_BUNDLE','status':'PUBLISHED','organizer_id':14,'registration_fee':688,'capacity':0,'reserved_count':0,'revision':0}})['insert_public_class_one']
print(json.dumps({'productId':str(product['id']),'title':product['title'],'price':688,'courseIds':ids},ensure_ascii=False))
