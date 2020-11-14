import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayEditorComponent } from './display-editor.component';

describe('DisplayEditorComponent', () => {
  let component: DisplayEditorComponent;
  let fixture: ComponentFixture<DisplayEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
