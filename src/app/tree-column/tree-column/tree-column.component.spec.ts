import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeColumnComponent } from './tree-column.component';

describe('TreeColumnComponent', () => {
  let component: TreeColumnComponent;
  let fixture: ComponentFixture<TreeColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreeColumnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
